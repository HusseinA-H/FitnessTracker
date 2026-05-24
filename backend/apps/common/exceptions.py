from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger('django')

def custom_exception_handler(exc, context):
    """
    Standardizes error responses to follow the pattern:
    {
        "success": False,
        "data": None,
        "message": "Descriptive error message",
        "errors": { ... }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data
        message = "Validation failed."

        if isinstance(errors, dict):
            if "detail" in errors:
                message = errors["detail"]
                # In some cases we don't want to duplicate detail under errors, but keep it for DRF compatibility
            elif "non_field_errors" in errors:
                message = errors["non_field_errors"][0]
        elif isinstance(errors, list):
            if errors:
                message = errors[0]
            errors = {"non_field_errors": errors}
        else:
            errors = {"detail": str(errors)}

        response.data = {
            "success": False,
            "data": None,
            "message": message,
            "errors": errors
        }
    else:
        # Log the unhandled traceback
        logger.exception("Unhandled exception in API request: %s", exc)
        response = Response({
            "success": False,
            "data": None,
            "message": "An unexpected server error occurred.",
            "errors": {"detail": str(exc)}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
