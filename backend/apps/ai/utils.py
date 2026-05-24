import re
from rest_framework import serializers

def sanitize_and_validate_prompt(content):
    """
    Sanitizes, validates, and protects AI chat prompts:
    1. Input validation (ensures prompt is not empty).
    2. Token overflow protection (limits character length to 2000).
    3. Strips HTML tags.
    4. Detects prompt injection / jailbreak patterns.
    """
    if not content or not content.strip():
        raise serializers.ValidationError("Prompt content cannot be empty.")

    # 1. Length cap for DoS/overflow protection (2000 chars roughly 300-400 tokens max)
    max_chars = 2000
    if len(content) > max_chars:
        raise serializers.ValidationError(f"Prompt content exceeds the safety limit of {max_chars} characters.")

    # 2. HTML stripping
    cleaned = re.sub(r'<[^>]*>', '', content)

    # 3. Detect known injection / jailbreaking signatures
    jailbreak_patterns = [
        r"ignore\s+(?:all\s+)?prior\s+instructions",
        r"bypass\s+(?:the\s+)?system",
        r"you\s+are\s+now\s+unrestricted",
        r"jailbreak",
        r"override\s+guidelines",
        r"ignore\s+(?:previous\s+)?rules",
        r"system\s+override",
        r"act\s+as\s+(?:a\s+)?developer",
        r"ignore\s+safety"
    ]

    for pattern in jailbreak_patterns:
        if re.search(pattern, cleaned, re.IGNORECASE):
            raise serializers.ValidationError(
                "Potential prompt injection or safety bypass attempt detected. This request has been blocked and logged."
            )

    return cleaned.strip()
