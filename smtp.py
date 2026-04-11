import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_custom_email(gmail_user, app_password, from_name, from_address, reply_to, recipient, subject, body):
    """
    Core logic for sending emails via Gmail SMTP.
    This function is used by both the standalone script and the Web Backend.
    """
    msg = MIMEMultipart()
    msg['From']     = f"{from_name} <{from_address}>"
    msg['To']       = recipient
    msg['Reply-To'] = reply_to
    msg['Subject']  = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.ehlo()
            server.starttls()                          # Encrypt connection
            server.login(gmail_user, app_password)     # Login with Gmail
            server.sendmail(gmail_user, recipient, msg.as_string())
        return True, "Email sent successfully!"
    except Exception as e:
        return False, str(e)

# standalone execution logic
if __name__ == "__main__":
    # ── Config ──────────────────────────────────────────
    YOUR_GMAIL     = "ENTER_GMAIL_HERE"       # Redacted for security
    APP_PASSWORD   = "ENTER_APP_PASSWORD_HERE" # Redacted for security
    FROM_NAME      = "Local Hustler"
    FROM_ADDRESS   = "info@localhuslter.com"
    REPLY_TO       = "info@localhuslter.com"
    RECIPIENT      = "samitaj8970@gmail.com"
    # ────────────────────────────────────────────────────

    success, message = send_custom_email(
        YOUR_GMAIL, APP_PASSWORD, FROM_NAME, FROM_ADDRESS, REPLY_TO, RECIPIENT, 
        "Hello from Local SMTP", "This is a test email."
    )
    
    if success:
        print(f"✅ {message}")
    else:
        print(f"❌ Error: {message}")