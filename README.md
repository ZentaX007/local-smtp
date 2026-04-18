# 🚀 ZenMail Hub

**ZenMail Hub** is a professional, full-stack local email application designed for developers and businesses to send emails securely via Gmail's SMTP service. Featuring a sleek, responsive React frontend and a high-performance FastAPI backend, ZenMail Hub provides a streamlined interface for configuring custom sender details, managing recipients, and ensuring reliable email delivery through encrypted TLS connections.

---

## ✨ Features

- **Modern Web Interface**: Built with React and Tailwind CSS for a premium, responsive experience.
- **FastAPI Backend**: High-performance Python backend handling SMTP logic and validation.
- **Custom Sender Identity**: Configure custom "From Name", "From Address", and "Reply-To" fields.
- **Secure Gmail Integration**: Uses Gmail SMTP with TLS encryption and App Passwords for maximum security.
- **Real-time Feedback**: Interactive form with loading states and success/error notifications.
- **Unified Startup**: Simple one-click startup for both frontend and backend development servers.
- **Micro-Animations**: Smooth transitions and hover effects powered by Framer Motion.

---

## 🛠️ Technology Stack

### Frontend
- **React (Vite)**: Core framework for a fast, reactive UI.
- **Tailwind CSS**: Utility-first styling for a custom, professional look.
- **Framer Motion**: Smooth animations and UI transitions.
- **Lucide React**: Beautiful, consistent iconography.
- **Axios**: Robust HTTP client for API communication.

### Backend
- **FastAPI**: Modern, fast (high-performance) web framework for building APIs.
- **Pydantic**: Data validation and settings management using Python type annotations.
- **smtplib**: Python's native library for sending emails via SMTP.
- **Uvicorn**: A lightning-fast ASGI server implementation.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (3.9 or higher)
- A Gmail account with **Two-Factor Authentication (2FA)** enabled.

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ZentaX007/local-smtp.git
cd local-smtp
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
pip install -r requirements.txt
```

### 3. Configure Gmail App Password
To send emails through Gmail securely, you must generate an **App Password**:
1. Go to your [Google Account Security settings](https://myaccount.google.com/security).
2. Enable **2-Step Verification**.
3. Search for **App Passwords**.
4. Create a new app (e.g., "ZenMail Hub") and copy the 16-character password provided.

---

## 🚥 Getting Started

### Unified Startup (Windows)
Simply run the included batch file to start both the Vite development server and the FastAPI backend:
```bash
./START_PROJECT.bat
```

### Manual Startup
If you prefer to run them separately:

**Frontend:**
```bash
npm run dev
# Server will run at http://localhost:5173
```

**Backend:**
```bash
python server.py
# API will run at http://localhost:8000
```

---

## 📁 Project Structure

```text
.
├── backend/            # Backend logic (if applicable)
├── frontend/           # Frontend source files
├── api/                # API route definitions
├── server.py           # FastAPI main entry point
├── smtp.py             # Core SMTP sending logic
├── index.html          # Main HTML entry point
├── package.json        # Frontend dependencies & scripts
├── requirements.txt    # Python dependencies
├── tailwind.config.js  # Styling configuration
└── START_PROJECT.bat   # Unified startup script
```

---

## 🛡️ Security Note

- **App Passwords**: Never hardcode your Gmail password. Always use App Passwords.
- **CORS**: The backend is configured to only allow requests from `localhost:5173` by default for security. Update `server.py` if your port changes.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open-source and available under the MIT License.
