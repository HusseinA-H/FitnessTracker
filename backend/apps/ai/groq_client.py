import os
import time
import logging
from groq import Groq
from django.conf import settings

logger = logging.getLogger('django')

DEFAULT_MODEL = 'llama-3.3-70b-versatile'
GROQ_TIMEOUT = 30

SYSTEM_PROMPT = (
    "You are FitCoach AI, a knowledgeable and motivating fitness assistant built into the "
    "FitnessTracker platform. You provide evidence-based advice on workouts, nutrition, recovery, "
    "and general health. You are concise, supportive, and safety-conscious. Never prescribe "
    "medication or diagnose medical conditions. If a user asks something outside your scope, "
    "advise them to consult a qualified professional. Keep responses under 300 words unless "
    "the user explicitly asks for detail."
)

INSIGHTS_SYSTEM_PROMPT = (
    "You are FitCoach AI, a fitness analytics assistant. Given a user's workout and progress "
    "data, generate a brief, motivating performance insight (2-3 sentences). Focus on trends, "
    "consistency, and actionable suggestions. If data is sparse, encourage the user to keep logging."
)

_client_cache = {}


def _get_client():
    api_key = os.environ.get('GROQ_API_KEY', '')
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured. Set it in your .env file.")
    if 'instance' not in _client_cache:
        _client_cache['instance'] = Groq(api_key=api_key, timeout=GROQ_TIMEOUT)
    return _client_cache['instance']


def _estimate_tokens(text):
    return max(1, len(text.split()) + len(text) // 4)


def chat_completion(messages, model=None, max_tokens=1024, temperature=0.7, user=None):
    model = model or getattr(settings, 'GROQ_DEFAULT_MODEL', DEFAULT_MODEL)
    client = _get_client()

    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    full_messages.extend(messages)

    start_time = time.time()
    try:
        response = client.chat.completions.create(
            model=model,
            messages=full_messages,
            max_tokens=max_tokens,
            temperature=temperature,
            user=str(user) if user else None,
        )
        response_time = time.time() - start_time

        choice = response.choices[0] if response.choices else None
        content = choice.message.content.strip() if choice and choice.message.content else ""

        usage = getattr(response, 'usage', None)
        prompt_tokens = usage.prompt_tokens if usage else _estimate_tokens(
            " ".join(m["content"] for m in full_messages)
        )
        completion_tokens = usage.completion_tokens if usage else _estimate_tokens(content)
        total_tokens = usage.total_tokens if usage else (prompt_tokens + completion_tokens)

        return {
            "content": content,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "model": model,
            "provider": "GROQ",
            "response_time": response_time,
        }
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise


def insights_completion(context_text, model=None, max_tokens=512, temperature=0.6):
    model = model or getattr(settings, 'GROQ_DEFAULT_MODEL', DEFAULT_MODEL)
    client = _get_client()

    messages = [
        {"role": "system", "content": INSIGHTS_SYSTEM_PROMPT},
        {"role": "user", "content": context_text},
    ]

    start_time = time.time()
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        response_time = time.time() - start_time

        choice = response.choices[0] if response.choices else None
        insight = choice.message.content.strip() if choice and choice.message.content else ""

        usage = getattr(response, 'usage', None)
        prompt_tokens = usage.prompt_tokens if usage else _estimate_tokens(context_text)
        completion_tokens = usage.completion_tokens if usage else _estimate_tokens(insight)
        total_tokens = usage.total_tokens if usage else (prompt_tokens + completion_tokens)

        return {
            "insight": insight,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "model": model,
            "provider": "GROQ",
            "response_time": response_time,
        }
    except Exception as e:
        logger.error(f"Groq insights API error: {e}")
        raise