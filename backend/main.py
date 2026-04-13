from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import uvicorn
import httpx
from typing import Literal, Optional

app = FastAPI(title="Local SMTP Hub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    provider: Literal["gmail", "brevo"]

    # Gmail fields
    gmail_address: Optional[str] = None
    app_password: Optional[str] = None

    # Brevo fields
    brevo_api_key: Optional[str] = None

    # Common fields
    from_name: str
    from_address: str
    reply_to: str
    recipient: EmailStr
    subject: str

    # Content — at least one must be provided
    message: Optional[str] = None        # plain text
    html_content: Optional[str] = None  # HTML email


import re
import html

def get_html_wrapper(subject: str, message: str, from_name: str) -> str:
    """Wraps a plain text message into a stylish HTML email template, adding a button if a link is detected, with full string sanitization."""
    
    # Check if there is a URL string in the message
    url_match = re.search(r'(https?://[^\s]+)', message)
    button_html = ""
    
    if url_match:
        url = url_match.group(1)
        # Remove the raw URL from the text so it isn't listed twice
        message = message.replace(url, "").strip()
        
        safe_url = html.escape(url)
        button_html = f"""
            <div style="text-align:center;margin:32px 0 16px;">
                <a href="{safe_url}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;letter-spacing:0.3px;">Click Here to Visit Website</a>
            </div>
        """
        
    # Prevent XSS & HTML layout breakage
    safe_subject = html.escape(subject)
    safe_from_name = html.escape(from_name)
    safe_message = html.escape(message)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{safe_subject}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
        <div style="border-radius:20px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.5);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:48px 40px;text-align:center;">
                <div style="font-size:52px;margin-bottom:16px;">✉️</div>
                <h1 style="color:#fff;margin:0;font-size:32px;font-weight:700;letter-spacing:-0.5px;">{safe_subject}</h1>
                <p style="color:rgba(255,255,255,0.75);margin:12px 0 0;font-size:16px;">From {safe_from_name}</p>
            </div>
            <!-- Body -->
            <div style="background:#1e293b;padding:40px;">
                <p style="color:#94a3b8;font-size:16px;line-height:1.8;margin:0;white-space:pre-wrap;">{safe_message}</p>
                {button_html}
            </div>
            <!-- Footer -->
            <div style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
                <p style="color:#475569;font-size:12px;margin:0;">This email was sent via Local SMTP Hub.</p>
            </div>
        </div>
    </div>
</body>
</html>"""

@app.post("/send-email")
@app.post("/api/send-email")
async def send_email(request: EmailRequest):
    if not request.message and not request.html_content:
        raise HTTPException(status_code=400, detail="Either message (plain text) or html_content must be provided.")

    # Automatically generate HTML content if only plain text message is provided
    if request.message and not request.html_content:
        request.html_content = get_html_wrapper(request.subject, request.message, request.from_name)

    if request.provider == "gmail":
        return await send_via_gmail(request)
    elif request.provider == "brevo":
        return await send_via_brevo(request)


async def send_via_gmail(request: EmailRequest):
    if not request.gmail_address or not request.app_password:
        raise HTTPException(status_code=400, detail="Gmail address and app password are required.")

    # Use multipart/alternative so clients get HTML if they support it, plain text as fallback
    msg = MIMEMultipart("alternative")
    msg['From']     = f"{request.from_name} <{request.from_address}>"
    msg['To']       = request.recipient
    msg['Reply-To'] = request.reply_to
    msg['Subject']  = request.subject
    msg['Sender']   = request.from_address

    # Always attach plain text part first
    plain = request.message or "Please view this email in an HTML-capable client."
    msg.attach(MIMEText(plain, 'plain'))

    # Attach HTML part if provided (takes priority in modern clients)
    if request.html_content:
        msg.attach(MIMEText(request.html_content, 'html'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.login(request.gmail_address, request.app_password)
            server.sendmail(request.from_address, request.recipient, msg.as_string())
        return {"status": "success", "message": "Email sent successfully via Gmail!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def send_via_brevo(request: EmailRequest):
    if not request.brevo_api_key:
        raise HTTPException(status_code=400, detail="Brevo API key is required.")

    payload = {
        "sender":  {"name": request.from_name, "email": request.from_address},
        "to":      [{"email": request.recipient}],
        "replyTo": {"email": request.reply_to},
        "subject": request.subject,
    }

    # Send HTML if available, plain otherwise
    if request.html_content:
        payload["htmlContent"] = request.html_content
    if request.message:
        payload["textContent"] = request.message

    headers = {
        "accept":       "application/json",
        "api-key":      request.brevo_api_key,
        "content-type": "application/json",
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.brevo.com/v3/smtp/email",
                json=payload,
                headers=headers,
            )
            if response.status_code not in (200, 201):
                detail = response.json().get("message", response.text)
                raise HTTPException(status_code=response.status_code, detail=f"Brevo error: {detail}")
        return {"status": "success", "message": "Email sent successfully via Brevo!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
