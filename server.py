from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from smtp import send_custom_email  # Importing directly from your working script
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
    # Calling the function from your smtp.py
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
