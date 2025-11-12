# خطوات رفع API على Vercel - خطوة بخطوة

## ✅ الخطوة 1: المشروع جاهز!
المشروع تم إنشاؤه في مجلد `service-egy-api` بجانب المشروع الرئيسي.

---

## 📦 الخطوة 2: تثبيت المكتبات

افتح Terminal في مجلد `service-egy-api` وشغل:

```bash
npm install
```

---

## 🔐 الخطوة 3: رفع المشروع على GitHub

### 3.1: تهيئة Git
```bash
git init
git add .
git commit -m "Initial commit: API route for contact form"
```

### 3.2: إنشاء Repository على GitHub

1. اذهب إلى [github.com](https://github.com)
2. اضغط على "+" في الأعلى → "New repository"
3. اسم الـ repository: `service-egy-api`
4. اختر "Private" (أو Public حسب رغبتك)
5. **لا** تضع علامة على "Initialize with README"
6. اضغط "Create repository"

### 3.3: ربط المشروع بـ GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/service-egy-api.git
git branch -M main
git push -u origin main
```

(استبدل `YOUR_USERNAME` باسم المستخدم على GitHub)

---

## 🚀 الخطوة 4: رفع المشروع على Vercel

### 4.1: تسجيل الدخول إلى Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط "Sign Up" أو "Log In"
3. سجل الدخول بحساب GitHub

### 4.2: إنشاء مشروع جديد

1. اضغط على "Add New" → "Project"
2. اختر repository `service-egy-api`
3. اضغط "Import"

### 4.3: إعداد Environment Variables

**قبل الضغط على Deploy:**

1. اضغط على "Environment Variables"
2. أضف المتغيرات التالية (اضغط "Add" لكل متغير):

```
Name: SMTP_HOST
Value: smtp.hostinger.com

Name: SMTP_PORT
Value: 465

Name: SMTP_USER
Value: your-email@service-egy.com
(استبدل بإيميلك على Hostinger)

Name: SMTP_PASSWORD
Value: your-password
(استبدل بكلمة مرور الإيميل)

Name: SMTP_FROM
Value: your-email@service-egy.com
(نفس الإيميل)

Name: SMTP_TO
Value: info@service-egy.com
(أو الإيميل اللي عايز تستقبل عليه الطلبات)

Name: ALLOWED_ORIGINS
Value: https://service-egy.com,https://www.service-egy.com
(أضف domains الموقع)
```

3. اضغط "Save"

### 4.4: Deploy

1. اضغط "Deploy"
2. انتظر حتى ينتهي الـ deployment (دقيقة أو دقيقتين)
3. بعد ما ينتهي، هتحصل على URL مثل: `https://service-egy-api.vercel.app`

### 4.5: الحصول على API URL

الـ API URL هيكون:
```
https://service-egy-api.vercel.app/api/contact
```

(استبدل `service-egy-api` باسم المشروع اللي اختاره Vercel)

---

## 🔄 الخطوة 5: تحديث المشروع الرئيسي

### 5.1: إنشاء ملف `.env.local`

في مجلد المشروع الرئيسي (`service-egy-website`)، أنشئ ملف `.env.local`:

```bash
NEXT_PUBLIC_CONTACT_ENDPOINT=https://service-egy-api.vercel.app/api/contact
```

(استبدل بالـ URL اللي حصلت عليه من Vercel)

### 5.2: تحديث `next.config.mjs`

افتح `next.config.mjs` في المشروع الرئيسي وتأكد إن فيه:

```javascript
const nextConfig = {
  output: 'export', // مهم جداً!
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
export default nextConfig
```

### 5.3: إعادة بناء المشروع

```bash
cd service-egy-website
npm run build
```

### 5.4: رفع مجلد `out` على Hostinger

1. افتح File Manager في Hostinger
2. ارفع محتويات مجلد `out` على الموقع

---

## ✅ الخطوة 6: اختبار

### 6.1: اختبار الـ API مباشرة

افتح Terminal وشغل:

```bash
curl -X POST https://service-egy-api.vercel.app/api/contact -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"address\":\"Test\",\"phone\":\"01123456789\",\"whatsapp\":\"01123456789\",\"issueType\":\"عطل كهربائي\",\"deviceType\":\"غسالة ملابس\"}"
```

### 6.2: اختبار الفورم على الموقع

1. اذهب إلى الموقع على Hostinger
2. املأ الفورم
3. تحقق من استلام الإيميل

---

## 🆘 استكشاف الأخطاء

### المشكلة: CORS Error
**الحل:** تأكد من إضافة domain الموقع في `ALLOWED_ORIGINS` في Vercel

### المشكلة: SMTP Error
**الحل:** 
- تحقق من صحة `SMTP_USER` و `SMTP_PASSWORD`
- تأكد من استخدام Port 465
- تحقق من أن Hostinger يسمح بـ SMTP connections

### المشكلة: API لا يعمل
**الحل:**
- تحقق من logs في Vercel Dashboard (Deployments → View Function Logs)
- تأكد من أن Environment Variables محفوظة بشكل صحيح

---

## 📝 ملاحظات مهمة

1. **لا تشارك `SMTP_PASSWORD` أبداً**
2. **تأكد من إضافة domain الموقع في `ALLOWED_ORIGINS`**
3. **يمكنك ربط domain مخصص للـ API مثل `api.service-egy.com` من Vercel Settings → Domains**

---

## 🎉 انتهى!

الآن الفورم هيعمل على الموقع ويرسل الإيميلات من خلال Vercel API!

