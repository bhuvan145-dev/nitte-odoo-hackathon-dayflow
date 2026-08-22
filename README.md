# 🌤️ Dayflow — Human Resource Management System

> **Every workday, perfectly aligned.**

Dayflow is a role-based HRMS that brings employee onboarding, attendance, leave management, and payroll visibility into one clean, unified platform — built for teams who want HR to just *work*.

---

## 🚀 Inspiration

HR teams juggle spreadsheets, email threads, and disconnected tools just to track who's on leave, who checked in, and who needs payroll updates. Dayflow was built to replace that chaos with a single source of truth — simple for employees, powerful for admins.

---

## ✨ Features

### 🔐 Secure Authentication
- Sign up with Employee ID, email, password & role (Employee / HR)
- Email verification & password security rules
- Role-based access control (Admin vs Employee)

### 📊 Smart Dashboards
- **Employee Dashboard** — quick-access cards for Profile, Attendance, Leave Requests, and recent activity
- **Admin/HR Dashboard** — employee directory, attendance records, and pending leave approvals in one view

### 👤 Employee Profile Management
- View personal details, job details, salary structure, documents & profile picture
- Employees can edit limited fields; Admins can edit all employee records

### 🕒 Attendance Tracking
- Daily & weekly attendance views
- Check-in / check-out flow
- Status tracking: Present, Absent, Half-day, Leave

### 🌴 Leave & Time-Off Management
- Apply for Paid, Sick, or Unpaid leave with date range & remarks
- Track request status: Pending → Approved / Rejected
- Admins can approve/reject with comments, reflected instantly in records

### 💰 Payroll Visibility
- Read-only payroll view for employees
- Admins can view & update salary structures across the org

### 📈 Extras
- Email & notification alerts
- Analytics & reports dashboard (salary slips, attendance reports)

---

## 🧩 System Design

Wireframes & flow diagrams: [View on Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/58RLEJ4oOwh)

**User Roles:**

| Role | Access |
|------|--------|
| 🛡️ **Admin / HR Officer** | Manage employees, approve leave & attendance, view/edit payroll |
| 👤 **Employee** | View profile, attendance & salary, apply for leave |

---

## 🛠️ Tech Stack

> _Update this section with your actual stack_

| Layer | Technology |
|-------|-----------|
| Frontend | `React / Next.js` |
| Backend | `Node.js / Express` |
| Database | `MongoDB / PostgreSQL` |
| Auth | `JWT / Firebase Auth` |
| Deployment | `Vercel / Render` |

---

## ⚙️ Getting Started

```bash
# Clone the repository
git clone https://github.com/<your-username>/dayflow.git
cd dayflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run the app
npm run dev
```

---

## 🗺️ Roadmap / Future Enhancements

- [ ] Mobile app for on-the-go attendance & leave requests
- [ ] AI-powered attendance anomaly detection
- [ ] Automated payroll processing & payslip generation
- [ ] Slack/Teams integration for approvals
- [ ] Multi-language support

---

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| Abhishek | — | [@AbhishekBRajpurohit](https://github.com/AbhishekBRajpurohit) |
| Syed | — | [@Syedowais312](https://github.com/Syedowais312) |
| Bhuvan | — | [@bhuvan145-dev](https://github.com/bhuvan145-dev) |
| Sparsh | — | [@Sparshgupta001](https://github.com/Sparshgupta001) |

---

## 📄 License

This project was built for **[Hackathon Name]** 2026. Licensed under the MIT License.

---

<p align="center">Made with ☀️ by the Dayflow Team</p>
