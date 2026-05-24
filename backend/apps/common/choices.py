from django.db import models

class UserRole(models.TextChoices):
    USER = 'USER', 'User'
    COACH = 'COACH', 'Coach'
    ADMIN = 'ADMIN', 'Admin'

class Gender(models.TextChoices):
    MALE = 'MALE', 'Male'
    FEMALE = 'FEMALE', 'Female'
    OTHER = 'OTHER', 'Other'

class FitnessLevel(models.TextChoices):
    BEGINNER = 'BEGINNER', 'Beginner'
    INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
    ADVANCED = 'ADVANCED', 'Advanced'

class SubscriptionStatus(models.TextChoices):
    PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Approval'
    ACTIVE = 'ACTIVE', 'Active'
    EXPIRED = 'EXPIRED', 'Expired'
    CANCELLED = 'CANCELLED', 'Cancelled'

class PaymentMethod(models.TextChoices):
    STRIPE = 'STRIPE', 'Stripe'
    BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'
    CASH = 'CASH', 'Cash'
    OTHER = 'OTHER', 'Other'

class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    SUCCESS = 'SUCCESS', 'Success'
    FAILED = 'FAILED', 'Failed'
    REFUNDED = 'REFUNDED', 'Refunded'

class NotificationType(models.TextChoices):
    SYSTEM = 'SYSTEM', 'System'
    SUBSCRIPTION = 'SUBSCRIPTION', 'Subscription'
    WORKOUT = 'WORKOUT', 'Workout'
    AI = 'AI', 'AI'
    PAYMENT = 'PAYMENT', 'Payment'

class AIRequestType(models.TextChoices):
    MACRO_CALCULATION = 'MACRO_CALCULATION', 'Macro Calculation'
    CHAT = 'CHAT', 'Chat'
    INSIGHTS = 'INSIGHTS', 'Insights'

class AIModelName(models.TextChoices):
    GROQ_LLAMA_3_3_70B = 'llama-3.3-70b-versatile', 'Llama 3.3 70B (Groq)'
    GROQ_LLAMA_3_1_8B = 'llama-3.1-8b-instant', 'Llama 3.1 8B Instant (Groq)'
    GROQ_MIXTRAL_8X7B = 'mixtral-8x7b-32768', 'Mixtral 8x7B (Groq)'
    GPT_4O = 'gpt-4o', 'GPT-4o'
    OTHER = 'other', 'Other'

class MessageRole(models.TextChoices):
    USER = 'user', 'User'
    ASSISTANT = 'assistant', 'Assistant'
    SYSTEM = 'system', 'System'

class AIProvider(models.TextChoices):
    GROQ = 'GROQ', 'Groq'
    OPENAI = 'OPENAI', 'OpenAI'
    ANTHROPIC = 'ANTHROPIC', 'Anthropic'
    GOOGLE = 'GOOGLE', 'Google'
    OTHER = 'OTHER', 'Other'

