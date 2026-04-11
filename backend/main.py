from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import uvicorn

app = FastAPI(title="Local SMTP Hub API")

# Tighten CORS for security
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
    gmail_address: EmailStr
    app_password: str
    from_name: str
    from_address: str
    reply_to: str
    recipient: EmailStr
    subject: str
    message: str

@app.post("/send-email")
async def send_email(request: EmailRequest):
    msg = MIMEMultipart()
    msg['From'] = f"{request.from_name} <{request.from_address}>"
    msg['To'] = request.recipient
    msg['Reply-To'] = request.reply_to
    msg['Subject'] = request.subject

    msg.attach(MIMEText(request.message, 'plain'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.login(request.gmail_address, request.app_password)
            server.sendmail(request.gmail_address, request.recipient, msg.as_string())
        return {"status": "success", "message": "Email sent successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
