# 🌐 Vexora Network

> **منصة اجتماعية وتفاعلية متكاملة تجمع بين التواصل العصري، المجموعات التفاعلية، المحادثات الفورية، وإمكانيات الذكاء الاصطناعي.**

---

## 📖 جدول المحتويات / Table of Contents
1. [نظرة عامة (Overview)](#-نظرة-عامة--overview)
2. [المميزات الرئيسية (Key Features)](#-المميزات-الرئيسية--key-features)
3. [التقنيات المستخدمة (Tech Stack)](#-التقنيات-المستخدمة--tech-stack)
4. [متطلبات التشغيل (Prerequisites)](#-متطلبات-التشغيل--prerequisites)
5. [التثبيت والتشغيل المحلي (Getting Started)](#-التثبيت-والتشغيل-المحلي--getting-started)
6. [إعداد المتغيرات البيئية (Environment Variables)](#-إعداد-المتغيرات-البيئية--environment-variables)
7. [خطوات رفع المشروع إلى GitHub (Publishing to GitHub)](#-خطوات-رفع-المشروع-إلى-github--publishing-to-github)
8. [الأوامر المتاحة (Available Scripts)](#-الأوامر-المتاحة--available-scripts)
9. [هيكل المشروع (Project Structure)](#-هيكل-المشروع--project-structure)

---

## 🌟 نظرة عامة / Overview

**Vexora Network** هي منصة شبكات وتواصل متطورة مبنية بأحدث معايير الويب (React 19 + TypeScript + Vite + Tailwind CSS + Express Backend). تدعم التخصيص الكامل للحسابات، التدوين ونشر النبضات (Pulses)، القصص السريعة (Stories)، غرف المجتمعات المتخصصة، المراسلة الفورية، ومساعد الذكاء الاصطناعي (Gemini AI).

---

## ⚡ المميزات الرئيسية / Key Features

- 👤 **إدارة حسابات وهوية متكاملة:** ملف شخصي قابل للتخصيص الكامل (صورة، غلاف، نبذة، كلمات مرور، وإعدادات أمان متطورة).
- 💬 **محادثات فورية ذكية (Vexora Chat):** رسائل مباشرة وغرف دردشة مع دعم مشاركة الوسائط وعارض الصور (Lightbox) المتطور.
- 📝 **محرر منشورات احترافي مع حفظ تلقائي فوري:** مؤشر حالة الحفظ التلقائي (Saved Status) المباشر أثناء الكتابة.
- 🌐 **مجتمعات نشطة (Communities):** إنشاء وإدارة مجتمعات وانضمام الأعضاء ومشاركة المنشورات التفاعلية.
- 🤖 **مساعد Vexora AI (مدعوم بـ Google Gemini):** ميزات توليد المحتوى، الترجمة الذكية، والإجابة التفاعلية.
- 🎨 **تصميم عصري فائق الأناقة:** مظهر داكن ناعم مستوحى من واجهات الجيل القادم، متجاوب تماماً مع كافة الهواتف والشاشات.

---

## 🛠️ التقنيات المستخدمة / Tech Stack

| المجال | التقنية |
|---|---|
| **الواجهة الأمامية (Frontend)** | React 19, TypeScript, Vite |
| **التنسيق والأنيميشن (Styling & Motion)** | Tailwind CSS, Motion (`motion/react`), Lucide React |
| **الواجهة الخلفية (Backend / API)** | Node.js, Express, Socket.IO, esbuild, tsx |
| **الذكاء الاصطناعي (AI)** | Google GenAI SDK (`@google/genai`) |
| **قواعد البيانات والتخزين (Database)** | Firebase Firestore & Local Storage Caching |

---

## 📋 متطلبات التشغيل / Prerequisites

قبل البدء، تأكد من تثبيت الأدوات التالية على جهازك:
- **Node.js** الإصدار `18.x` أو `20.x` أو أحدث. ([تحميل Node.js](https://nodejs.org/))
- **Git** لإدارة الإصدارات والرفع على GitHub. ([تحميل Git](https://git-scm.com/))
- مدير الحزم **npm** (يأتي مدمجاً مع Node.js) أو **yarn** / **pnpm**.

---

## 🚀 التثبيت والتشغيل المحلي / Getting Started

### 1. استنساخ المستودع (Clone Repository)
```bash
git clone https://github.com/YOUR_USERNAME/vexora-network.git
cd vexora-network
```

### 2. تثبيت الحزم والمكتبات (Install Dependencies)
```bash
npm install
```

### 3. إعداد المتغيرات البيئية (Configure Environment)
قم بإنشاء ملف `.env` بنسخ محتويات `.env.example`:
```bash
cp .env.example .env
```
ثم افتح ملف `.env` وضع مفاتيح الـ API الخاصة بك (مثل مفتاح Gemini).

### 4. تشغيل خادم التطوير (Run Development Server)
```bash
npm run dev
```
سيعمل التطبيق افتراضياً على الرابط: `http://localhost:3000`

---

## 🔐 إعداد المتغيرات البيئية / Environment Variables

تحقق من الملف `.env.example` الذي يحتوي على كافة المتغيرات المدعومة:

```env
# مفتاح Google Gemini API
GEMINI_API_KEY="your-gemini-api-key-here"

# عنوان التطبيق
APP_URL="http://localhost:3000"

# بيانات اعتماد Google OAuth (اختياري)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# إعدادات بريد الإشعارات (SMTP / Gmail - اختياري)
GMAIL_USER=""
GMAIL_APP_PASSWORD=""
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
```

---

## 📤 خطوات رفع المشروع إلى GitHub / Publishing to GitHub

اتبع هذه الخطوات البسيطة لرفع مشروعك لأول مرة إلى GitHub:

### الخطوة 1: تهيئة مستودع Git محلياً
```bash
git init
```

### الخطوة 2: إضافة الملفات وإنشاء أول Commit
```bash
git add .
git commit -m "feat: initial commit for Vexora Network"
```

### الخطوة 3: إنشاء مستودع جديد على حسابك في GitHub
1. اذهب إلى [GitHub New Repository](https://github.com/new).
2. اختر اسماً للمستودع (مثال: `vexora-network`).
3. اختر المستودع **Public** أو **Private**.
4. **لا تقم بتحديد** إضافة README أو .gitignore (لأننا جهزناها مسبقاً).
5. اضغط على **Create repository**.

### الخطوة 4: ربط المستودع والرفع (Push)
قم بتنفيذ الأوامر التالية (مع استبدال `YOUR_USERNAME` باسم حسابك):
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vexora-network.git
git push -u origin main
```

---

## 📜 الأوامر المتاحة / Available Scripts

| الأمر | الوصف |
|---|---|
| `npm run dev` | تشغيل المشروع في بيئة التطوير السريعة (TypeScript + Express + Vite). |
| `npm run build` | بناء نسخة الإنتاج الكاملة للواجهة الأمامية والخلفية داخل مجلد `dist/`. |
| `npm start` | تشغيل خادم الإنتاج المترجم بعد عمل `build`. |
| `npm run lint` | فحص أخطاء وتوافق أكواد TypeScript. |
| `npm run clean` | مسح مجلد الإنتاج `dist` لإعادة البناء من الصفر. |

---

## 📂 هيكل المشروع / Project Structure

```text
├── src/
│   ├── components/            # مكونات الواجهة التفاعلية (Chat, Modals, Feed, Settings)
│   ├── lib/                   # دوال مساعدة وإعدادات Firebase
│   ├── App.tsx                # المكون الرئيسي وتنسيق الصفحات والملاحة
│   ├── main.tsx               # نقطة انطلاق تطبيق React
│   ├── types.ts               # تعريفات الأنواع (TypeScript Types & Interfaces)
│   └── index.css              # ملف تنسيقات Tailwind العالمية
├── server.ts                  # خادم Express ومسارات الـ API وإدارة الـ WebSockets
├── metadata.json              # بيانات التطبيق وصلاحياته
├── index.html                 # ملف الدخول الرئيسي للصفحة
├── package.json               # الحزم والمكتبات والسكربتات
├── vite.config.ts             # إعدادات Vite
├── tsconfig.json              # إعدادات مترجم TypeScript
├── .env.example               # نموذج المتغيرات البيئية
├── .gitignore                 # استثناء الملفات الحساسة والمؤقتة من Git
└── README.md                  # دليل المشروع والتوثيق
```

---

## 📄 الترخيص / License

هذا المشروع مرخص تحت رخصة **MIT License** - يحق لك الاستخدام والتعديل والتطوير بحرية.
