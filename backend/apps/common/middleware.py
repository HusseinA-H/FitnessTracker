import time
import logging
import re
from common.models import log_audit_event

logger = logging.getLogger('django')

_API_PATH_PREFIXES = ('/api/',)


class SecurityHeadersMiddleware:
    """
    Middleware that applies security headers selectively.
    API responses: only headers that don't interfere with CORS (no CSP, no COOP).
    HTML responses: full CSP, COOP, and other browser-security headers.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        is_api = request.path.startswith(_API_PATH_PREFIXES)

        if is_api:
            response["X-Content-Type-Options"] = "nosniff"
            response["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
            if "Cross-Origin-Opener-Policy" in response:
                del response["Cross-Origin-Opener-Policy"]
            if "Cross-Origin-Embedder-Policy" in response:
                del response["Cross-Origin-Embedder-Policy"]
        else:
            response["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "img-src 'self' data:; "
                "font-src 'self' https://fonts.gstatic.com; "
                "connect-src 'self'; "
                "frame-ancestors 'none'; "
                "object-src 'none';"
            )
            response["Cross-Origin-Opener-Policy"] = "same-origin"
            response["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        return response


class RequestLoggingMiddleware:
    """
    Middleware to log details of every incoming API request and outgoing response,
    identifying and flagging suspicious activities.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/static/') or request.path.startswith('/media/'):
            return self.get_response(request)

        start_time = time.time()

        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded.split(',')[0].strip() if x_forwarded else request.META.get('REMOTE_ADDR')

        response = self.get_response(request)

        duration = time.time() - start_time

        log_msg = f"IP: {ip} | Method: {request.method} | Path: {request.path} | Status: {response.status_code} | Duration: {duration:.3f}s"

        if response.status_code >= 500:
            logger.error(log_msg)
        elif response.status_code >= 400:
            logger.warning(log_msg)

            suspicious_patterns = ['.git', 'wp-admin', 'phpmyadmin', '.env', 'eval(', '../', 'etc/passwd']
            is_suspicious = any(pattern in request.path.lower() for pattern in suspicious_patterns)

            try:
                from django.http import RawPostDataException
                payload = request.body.decode('utf-8', errors='ignore')
            except (RawPostDataException, Exception):
                payload = ""
            sql_or_xss_patterns = [r"UNION\s+SELECT", r"<script>", r"javascript:", r"OR\s+1=1"]
            if any(re.search(pattern, payload, re.IGNORECASE) for pattern in sql_or_xss_patterns):
                is_suspicious = True

            if is_suspicious or response.status_code in [403, 405]:
                suspicious_msg = f"[SUSPICIOUS ACTIVITY WARNING] IP: {ip} | Suspicious request path: {request.path} | Status: {response.status_code}"
                logger.warning(suspicious_msg)

                log_audit_event(
                    actor=request.user if (request.user and request.user.is_authenticated) else None,
                    action="SUSPICIOUS_REQUEST_ALERT",
                    request=request,
                    status="WARNING",
                    details={
                        "path": request.path,
                        "method": request.method,
                        "status_code": response.status_code,
                        "is_suspicious_pattern": is_suspicious
                    }
                )
        else:
            logger.info(log_msg)

        return response