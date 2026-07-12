import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .knowledge_base import find_best_response


@method_decorator(csrf_exempt, name='dispatch')
class ChatbotView(View):
    """
    POST /api/chat/
    Body: { "message": "How do I log a carbon transaction?" }
    Returns: { "response": "...", "page": "Environmental", "confidence": 90, "matched": true }
    """

    def post(self, request, *args, **kwargs):
        try:
            body = json.loads(request.body)
            message = body.get('message', '').strip()
        except (json.JSONDecodeError, AttributeError):
            return JsonResponse(
                {"error": "Invalid JSON body. Expected: {\"message\": \"your question\"}"},
                status=400
            )

        if not message:
            return JsonResponse(
                {"error": "Message field is required and cannot be empty."},
                status=400
            )

        if len(message) > 1000:
            return JsonResponse(
                {"error": "Message is too long. Maximum 1000 characters."},
                status=400
            )

        result = find_best_response(message)
        return JsonResponse(result, status=200)

    def get(self, request, *args, **kwargs):
        """Health check endpoint — returns bot info."""
        return JsonResponse({
            "name": "EcoBot",
            "version": "1.0.0",
            "description": "EcoSphere ESG Platform AI Assistant (keyword-matching engine)",
            "endpoint": "POST /api/chat/ with body: {\"message\": \"your question\"}",
            "topics": [
                "Environmental", "Carbon Tracking", "Emission Factors", "Environmental Goals",
                "Social", "CSR Activities", "Participation", "Diversity",
                "Governance", "Policies", "Audits", "Compliance Issues",
                "Gamification", "Challenges", "XP", "Badges", "Rewards", "Leaderboard",
                "Reports", "ESG Summary", "Custom Builder", "PDF/Excel/CSV Export",
                "Settings", "Departments", "Categories", "Notifications", "ESG Weights"
            ],
            "status": "online"
        })
