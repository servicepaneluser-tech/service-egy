import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

function getCorsHeaders(requestOrigin: string | null) {
  const hasWildcard = allowedOrigins.includes("*")
  let origin = "*"

  if (requestOrigin && (hasWildcard || allowedOrigins.includes(requestOrigin))) {
    origin = requestOrigin
  } else if (!hasWildcard && allowedOrigins.length > 0) {
    origin = allowedOrigins[0]
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

export async function OPTIONS(request: Request) {
  const headers = getCorsHeaders(request.headers.get("origin"))
  return new NextResponse(null, { status: 204, headers })
}

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request.headers.get("origin"))

  try {
    const body = await request.json()
    const { name, address, phone, whatsapp, issueType, deviceType, details, serviceType, brandName } = body

    // Validate required fields
    if (!name || !address || !phone || !whatsapp || !issueType || !deviceType) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Format email content (remove emoji from subject to avoid spam)
    const emailSubject = `طلب صيانة جديد من ${name}`
    const emailBody = `
طلب صيانة جديد من موقع Service Egy

البيانات الشخصية:
- الاسم: ${name}
- العنوان: ${address}
- رقم التليفون: ${phone}
- رقم الواتساب: ${whatsapp}

تفاصيل الطلب:
- نوع العطل: ${issueType}
- نوع الجهاز: ${deviceType}
${serviceType ? `- نوع الخدمة: ${serviceType}` : ""}
${brandName ? `- الماركة: ${brandName}` : ""}
${details ? `- تفاصيل إضافية: ${details}` : ""}

التاريخ والوقت: ${new Date().toLocaleString("ar-EG", {
      timeZone: "Africa/Cairo",
    })}
    `.trim()

    // Get SMTP settings from environment variables
    const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com"
    const smtpPort = parseInt(process.env.SMTP_PORT || "465")
    const smtpUser = process.env.SMTP_USER // email@service-egy.com
    const smtpPassword = process.env.SMTP_PASSWORD
    const smtpFrom = process.env.SMTP_FROM || smtpUser || "info@service-egy.com"
    const smtpTo = process.env.SMTP_TO || "info@service-egy.com"

    // Validate SMTP settings
    if (!smtpUser || !smtpPassword) {
      console.error("SMTP credentials not configured")
      return NextResponse.json(
        { error: "إعدادات الإيميل غير مكتملة. يرجى التحقق من إعدادات SMTP." },
        { status: 500, headers: corsHeaders }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      tls: {
        rejectUnauthorized: false, // Only if you get certificate errors
      },
    })

    // Escape HTML to prevent XSS
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
    }

    // Send email
    // Important: Use the same email as SMTP_USER for From address to avoid spam
    const mailOptions = {
      from: `"Service Egy" <${smtpUser}>`, // Use SMTP_USER, not SMTP_FROM
      to: smtpTo,
      replyTo: smtpUser, // Reply to the same email
      subject: emailSubject,
      text: emailBody,
      headers: {
        "X-Mailer": "Service Egy Contact Form",
        "MIME-Version": "1.0",
      },
      html: `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>طلب صيانة جديد</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 20px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 100%;">
          
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">
                🔧 طلب صيانة جديد
              </h1>
              <p style="color: #e0e7ff; margin: 0; font-size: 16px;">
                من موقع Service Egy
              </p>
            </td>
          </tr>

          <!-- Alert Badge -->
          <tr>
            <td style="padding: 20px 30px;">
              <div style="background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px 20px; border-radius: 8px;">
                <p style="margin: 0; color: #92400e; font-weight: bold;">
                  ⚡ طلب جديد يحتاج متابعة فورية
                </p>
              </div>
            </td>
          </tr>

          <!-- Customer Info Section -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 25px; border: 2px solid #bfdbfe;">
                <tr>
                  <td>
                    <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                      👤 البيانات الشخصية
                    </h2>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #1e40af; font-weight: bold; width: 35%;">الاسم:</td>
                        <td style="color: #1e3a8a; font-size: 16px;">${escapeHtml(name)}</td>
                      </tr>
                      <tr style="background: rgba(255,255,255,0.5);">
                        <td style="color: #1e40af; font-weight: bold;">العنوان:</td>
                        <td style="color: #1e3a8a;">${escapeHtml(address)}</td>
                      </tr>
                      <tr>
                        <td style="color: #1e40af; font-weight: bold;">رقم التليفون:</td>
                        <td>
                          <a href="tel:${phone}" style="color: #2563eb; text-decoration: none; font-weight: bold; font-size: 16px;">
                            📞 ${escapeHtml(phone)}
                          </a>
                        </td>
                      </tr>
                      <tr style="background: rgba(255,255,255,0.5);">
                        <td style="color: #1e40af; font-weight: bold;">رقم الواتساب:</td>
                        <td>
                          <a href="https://wa.me/${whatsapp.replace(/^0/, '20')}" style="background: #25D366; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">
                            💬 ${escapeHtml(whatsapp)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Service Details Section -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; border: 2px solid #fbbf24;">
                <tr>
                  <td>
                    <h2 style="color: #92400e; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
                      🔧 تفاصيل الطلب
                    </h2>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #92400e; font-weight: bold; width: 35%;">نوع العطل:</td>
                        <td style="color: #78350f; font-size: 16px; font-weight: bold;">${escapeHtml(issueType)}</td>
                      </tr>
                      <tr style="background: rgba(255,255,255,0.5);">
                        <td style="color: #92400e; font-weight: bold;">نوع الجهاز:</td>
                        <td style="color: #78350f; font-weight: bold;">${escapeHtml(deviceType)}</td>
                      </tr>
                      ${serviceType ? `
                      <tr>
                        <td style="color: #92400e; font-weight: bold;">نوع الخدمة:</td>
                        <td style="color: #78350f;">${escapeHtml(serviceType)}</td>
                      </tr>` : ""}
                      ${brandName ? `
                      <tr style="background: rgba(255,255,255,0.5);">
                        <td style="color: #92400e; font-weight: bold;">الماركة:</td>
                        <td style="color: #78350f; font-weight: bold; font-size: 18px;">🏷️ ${escapeHtml(brandName)}</td>
                      </tr>` : ""}
                      ${details ? `
                      <tr>
                        <td colspan="2" style="padding-top: 15px;">
                          <div style="background: #ffffff; padding: 15px; border-radius: 8px; border-right: 4px solid #f59e0b;">
                            <strong style="color: #92400e;">تفاصيل إضافية:</strong><br>
                            <p style="color: #78350f; margin: 10px 0 0 0; line-height: 1.6;">${escapeHtml(details).replace(/\n/g, '<br>')}</p>
                          </div>
                        </td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="padding: 5px;">
                    <a href="tel:${phone}" style="display: block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; text-align: center; padding: 15px 20px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px;">
                      📞 اتصل بالعميل
                    </a>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding: 5px;">
                    <a href="https://wa.me/${whatsapp.replace(/^0/, '20')}" style="display: block; background: #25D366; color: white; text-align: center; padding: 15px 20px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px;">
                      💬 واتساب
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h3 style="color: #ffffff; margin: 0 0 5px 0; font-size: 24px; font-weight: bold;">
                      Service Egy
                    </h3>
                    <p style="color: #94a3b8; margin: 0; font-size: 14px;">
                      مركز الصيانة المتخصص لجميع الأجهزة المنزلية
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #475569; padding-top: 20px;">
                    <p style="color: #cbd5e1; margin: 5px 0; font-size: 14px;">
                      📞 الخط الساخن: <strong style="color: #ffffff; font-size: 18px;">19451</strong>
                    </p>
                    <p style="color: #cbd5e1; margin: 5px 0; font-size: 13px;">
                      📧 info@service-egy.com
                    </p>
                    <p style="color: #cbd5e1; margin: 5px 0; font-size: 13px;">
                      🌐 www.service-egy.com
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <p style="color: #64748b; margin: 0; font-size: 11px;">
                      🕐 ${new Date().toLocaleString("ar-EG", { timeZone: "Africa/Cairo", dateStyle: "full", timeStyle: "short" })}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        
        <!-- Footer Note -->
        <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 20px;">
          هذا الإيميل تلقائي من نظام طلبات الصيانة في موقع Service Egy
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    }

    const info = await transporter.sendMail(mailOptions)

    console.log("Email sent successfully:", info.messageId)

    return NextResponse.json(
      { 
        message: "تم إرسال الطلب بنجاح", 
        success: true,
        messageId: info.messageId 
      },
      { status: 200, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("Error sending email:", error)
    
    let errorMessage = "حدث خطأ أثناء إرسال الإيميل"
    if (error.code === "EAUTH") {
      errorMessage = "خطأ في بيانات الدخول SMTP. يرجى التحقق من اسم المستخدم وكلمة المرور."
    } else if (error.code === "ECONNECTION") {
      errorMessage = "فشل الاتصال بخادم SMTP. يرجى التحقق من إعدادات SMTP."
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders }
    )
  }
}
