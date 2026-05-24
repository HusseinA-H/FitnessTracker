from rest_framework.throttling import SimpleRateThrottle

class AIChatThrottle(SimpleRateThrottle):
    """
    Limits AI chatbot queries to a rate specified by the 'ai_rate' key in settings.
    Default rate is 5/minute per authenticated user.
    """
    scope = 'ai_rate'

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"throttle_ai_{request.user.id}"
        # Fallback to IP address if anonymous (though AI calls require authentication)
        return self.get_ident(request)
