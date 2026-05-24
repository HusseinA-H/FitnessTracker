from rest_framework.renderers import JSONRenderer

class StandardizedJSONRenderer(JSONRenderer):
    """
    Wraps standard DRF success responses into:
    {
        "success": True,
        "data": { ... },
        "message": "Operation completed successfully.",
        "errors": None
    }
    """
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None
        
        # If response is an error (status_code >= 400), it has already been formatted by custom_exception_handler.
        # However, we must ensure it doesn't get double-wrapped or messed up.
        if response and response.status_code >= 400:
            return super().render(data, accepted_media_type, renderer_context)
            
        # Determine if response is already formatted (e.g. from custom endpoints)
        if isinstance(data, dict) and ('success' in data and 'data' in data and 'errors' in data):
            formatted_data = data
        else:
            # Standard wrap
            formatted_data = {
                "success": True,
                "data": data,
                "message": "Operation completed successfully.",
                "errors": None
            }

        return super().render(formatted_data, accepted_media_type, renderer_context)
