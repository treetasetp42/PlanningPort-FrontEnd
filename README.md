# InvestPlanner - Frontend

[English](#english) | [ภาษาไทย](#ภาษาไทย)

---

## English

InvestPlanner is a web application for managing investment portfolios and tracking stock prices. This project was built to practice building modern web applications, focusing on React 19, state management, and API integration.

🔗 **Backend Repository:** [https://github.com/treetasetp42/3TaC8-PlanningPort](https://github.com/treetasetp42/3TaC8-PlanningPort)

### Tech Stack
- **Framework:** React 19 + Vite
- **State Management:** Redux Toolkit
- **UI & Styling:** Material-UI (MUI) v7
- **Routing:** React Router v7
- **HTTP Client:** Axios (with automatic token refresh interceptors)
- **Authentication:** JWT & Google OAuth (`@react-oauth/google`)
- **Internationalization:** i18next

### Key Features
- **Login System:** Traditional Email/Password and Google OAuth.
- **Portfolio Tracking:** Manage assets and view total value.
- **Stock Data:** Real-time search and prices powered by Finnhub API.
- **Admin Dashboard:** User management tools for administrators.
- **Responsive:** Optimized for mobile and desktop screens.

### Local Setup
1. **Clone the repo**
   ```bash
   git clone https://github.com/treetasetp42/planning-port-front-end.git
   cd planning-port-front-end
   ```
2. **Install packages**
   ```bash
   npm install
   ```
3. **Environment Variables**
   Create a `.env` file in the root:
   ```env
   VITE_API_BASE_URL=http://localhost:5139
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
4. **Run**
   ```bash
   npm run dev
   ```

---

## ภาษาไทย

โปรเจกต์นี้เป็นส่วน Frontend ของระบบจัดการพอร์ตลงทุน (InvestPlanner) สร้างขึ้นมาเพื่อเป็นโปรเจกต์ฝึกหัดและทดลองต่อ API เข้ากับระบบ Backend ไอเดียหลักคือการทำเว็บแอปพลิเคชันสำหรับบันทึกสินทรัพย์และดูราคาหุ้นเบื้องต้น

### เครื่องมือที่ใช้
- **Framework:** React 19 + Vite
- **State Management:** Redux Toolkit
- **UI & Styling:** Material-UI (MUI) v7
- **Authentication:** JWT และ Google OAuth
- **Localization:** ระบบหลายภาษาด้วย i18next

### ฟีเจอร์หลัก
- **ระบบ Login:** เข้าสู่ระบบด้วย Email/Password หรือ Google
- **จัดการพอร์ต:** เพิ่มรายการสินทรัพย์และดูยอดรวม
- **ข้อมูลหุ้น:** ค้นหาหุ้นแบบ Real-time (Finnhub API)
- **Responsive:** รองรับทุกหน้าจอ

### วิธีรันโปรเจกต์
1. **โหลดโปรเจกต์:** `git clone https://github.com/treetasetp42/planning-port-front-end.git`
2. **ติดตั้ง:** `npm install`
3. **ตั้งค่า .env:** สร้างไฟล์ `.env` และใส่ `VITE_API_BASE_URL` และ `VITE_GOOGLE_CLIENT_ID`
4. **รัน:** `npm run dev`


---

**Note:** This project was developed using AI-assisted tools to accelerate coding and boilerplate generation. The core architecture, system logic, database design, and cloud deployment were manually structured and managed.

---

## 📜 Changelog
Detailed history of changes can be found in [CHANGELOG.md](./CHANGELOG.md).