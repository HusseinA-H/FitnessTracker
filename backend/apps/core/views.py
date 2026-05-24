from django.http import JsonResponse

def health_check(request):
    """
    API Health Check Endpoint.
    Returns HTTP 200 JSON payload to confirm service availability.
    """
    return JsonResponse({
        "status": "healthy",
        "service": "fitnesstracker-backend",
        "version": "v1.0.0"
    })

