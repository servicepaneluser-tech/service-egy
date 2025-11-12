# Service Egy API

API Route for Service Egy Contact Form deployed on Vercel.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in Vercel:
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD
- SMTP_FROM
- SMTP_TO
- ALLOWED_ORIGINS

3. Deploy to Vercel:
```bash
vercel
```

## Environment Variables

- `SMTP_HOST`: SMTP server host (e.g., smtp.hostinger.com)
- `SMTP_PORT`: SMTP server port (e.g., 465)
- `SMTP_USER`: SMTP username (your email)
- `SMTP_PASSWORD`: SMTP password
- `SMTP_FROM`: From email address
- `SMTP_TO`: To email address
- `ALLOWED_ORIGINS`: Allowed origins for CORS (comma-separated)

## API Endpoint

POST `/api/contact`

Request body:
```json
{
  "name": "string",
  "address": "string",
  "phone": "string",
  "whatsapp": "string",
  "issueType": "string",
  "deviceType": "string",
  "details": "string",
  "serviceType": "string",
  "brandName": "string"
}
```

Response:
```json
{
  "message": "تم إرسال الطلب بنجاح",
  "success": true,
  "messageId": "string"
}
```

