import os
import uuid
from django.core.exceptions import ValidationError
from PIL import Image

def validate_secure_image(file):
    """
    Validates that the file:
    1. Size is under 5MB.
    2. Has a valid image extension (.png, .jpg, .jpeg).
    3. Is a valid image format verified by opening with Pillow.
    """
    # 1. Size limit: 5MB
    limit_mb = 5
    if file.size > limit_mb * 1024 * 1024:
        raise ValidationError(f"File size exceeds the limit of {limit_mb}MB.")

    # 2. Extension check
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.png', '.jpg', '.jpeg']
    if ext not in valid_extensions:
        raise ValidationError("Unsupported file extension. Only PNG, JPG, and JPEG images are allowed.")

    # 3. Content checking (MIME/magic bytes check via Pillow)
    try:
        # Seek to beginning in case file has been read
        file.seek(0)
        img = Image.open(file)
        img.verify()
        file.seek(0) # reset pointer after reading
    except Exception:
        raise ValidationError("Uploaded file is corrupt or not a valid image format.")


def secure_proof_upload_path(instance, filename):
    """
    Renames the uploaded proof image to a random UUID to prevent
    directory traversal and metadata leakage.
    """
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ['.png', '.jpg', '.jpeg']:
        ext = '.jpg'
    safe_name = f"{uuid.uuid4()}{ext}"
    return f"payment_proofs/{safe_name}"
