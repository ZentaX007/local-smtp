from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import sys
import os

# Ensure the root directory is in the path so we can import smtp.py from the root
# Vercel's root is usually /var/task
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from smtp import send_custom_email
except ImportError as e:
    # DEBUG: Help identify if smtp.py is missing in the deployment
    from_smtp_status = f"Import failed: {str(e)}. Current path: {sys.path}"
else:
    from_smtp_status = "Import successful"

app = FastAPI()

class EmailRequest(BaseModel):
    gmail_address: EmailStr
    app_password: str
    from_name: str
    from_address: str
    reply_to: str
    recipient: EmailStr
    subject: str
    message: str

@app.post("/api/send-email")
async def send_email(request: EmailRequest):
    if "failed" in from_smtp_status:
        raise HTTPException(status_code=500, detail=from_smtp_status)

    success, message = send_custom_email(
        gmail_user=request.gmail_address,
        app_password=request.app_password,
        from_name=request.from_name,
        from_address=request.from_address,
        reply_to=request.reply_to,
        recipient=request.recipient,
        subject=request.subject,
        body=request.message
    )

    if success:
        return {"status": "success", "message": message}
    else:
        raise HTTPException(status_code=500, detail=message)

# Health check route
@app.get("/api/send-email")
async def health():
    return {"status": "ok", "import_status": from_smtp_status}
