from abc import ABC, abstractmethod
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class NotificationProvider(ABC):
    @abstractmethod
    def send(self, destination: str, subject: str, message: str):
        pass

class MockProvider(NotificationProvider):
    def send(self, destination: str, subject: str, message: str):
        print(f"[MOCK NOTIFICATION] To: {destination} | Subject: {subject} | Body: {message}")

class SMTPProvider(NotificationProvider):
    def __init__(self):
        self.host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.port = int(os.getenv("SMTP_PORT", 587))
        self.user = os.getenv("SMTP_USER")
        self.password = os.getenv("SMTP_PASS")
        
    def send(self, destination: str, subject: str, message: str):
        if not self.user or not self.password:
            # Fallback to mock if not configured
            print(f"[SMTP FALLBACK] To: {destination} | Subject: {subject} | Msg: {message}")
            return
            
        try:
            msg = MIMEMultipart()
            msg['From'] = self.user
            msg['To'] = destination
            msg['Subject'] = subject
            
            # Use basic HTML template
            html = f"""
            <html>
                <body>
                    <div style='background:#f4f4f4; padding:20px; font-family:sans-serif;'>
                        <h2 style='color:#3b82f6;'>Antigravity Alerts</h2>
                        <div style='background:white; padding:20px; border-radius:8px;'>
                            <p style='font-size:16px;'>{message}</p>
                        </div>
                    </div>
                </body>
            </html>
            """
            
            msg.attach(MIMEText(html, 'html'))
            
            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.send_message(msg)
                print(f"[SMTP] Successfully sent to {destination}")
                
        except Exception as e:
            print(f"[SMTP ERROR] Failed to send email: {e}")
