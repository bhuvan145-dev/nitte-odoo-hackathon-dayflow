# Dayflow HRMS — Native Odoo Module

*Every workday, perfectly aligned.*

A native Odoo addon (Python + XML, PostgreSQL via the Odoo ORM — no
external frontend stack) implementing the Dayflow HRMS requirements:
authentication & role-based access, employee profiles, attendance
tracking, leave/time-off with approvals, and payroll visibility.

## Install

1. Copy the `dayflow_hrms` folder into your Odoo `addons` path
   (e.g. `odoo/addons/dayflow_hrms`).
2. Restart the Odoo server with `-u dayflow_hrms` (or `--update=dayflow_hrms`)
   so it picks up the new module, e.g.:
   ```
   ./odoo-bin -c odoo.conf -u dayflow_hrms -d your_database
   ```
3. Go to **Apps**, remove the "Apps" filter, search "Dayflow HRMS", and
   click **Install** (if it wasn't auto-picked up by step 2).
4. Go to **Settings → Users & Companies → Users**, open a user, and
   under **Dayflow HRMS** assign the **Employee** or **HR Officer / Admin**
   group. (Odoo's built-in Sign Up flow already covers registration,
   email verification and Sign In — this module maps a user's role
   onto Dayflow's own permission groups on top of that.)

## Module map (matches the requirements doc)

| Requirement | Where it lives |
|---|---|
| Role-based access (Admin vs Employee) | `security/hr_security.xml` — two groups + `ir.rule` row-level rules |
| Employee profile (view/edit) | `models/employee.py` extends `hr.employee`; `views/employee_views.xml` adds a "Dayflow HRMS" tab with identity, payroll (admin-only) and documents |
| Attendance (check-in/out, daily/weekly, statuses) | `models/attendance.py` (`dayflow.attendance`) + `views/attendance_views.xml` |
| Leave & time-off (apply, Pending/Approved/Rejected) | `models/leave.py` (`dayflow.leave.request`) + `views/leave_views.xml`, with chatter/activity tracking via `mail.thread` |
| Leave approval (Admin) | `action_approve` / `action_reject` methods, restricted to the Admin group, surfaced on an "Approvals" menu filtered to pending requests |
| Payroll (read-only for employee, editable for Admin) | Salary/bank/PAN fields on `hr.employee`, gated with `groups="dayflow_hrms.group_dayflow_admin"` |
| Dashboards | `menus.xml` — "My Profile" for employees, "Employees" / "Payroll" / "Approvals" for Admin; stat buttons on the employee form link to that employee's attendance and leave records |

## Demo script for judges

1. Log in as an **HR Officer / Admin** → open **Dayflow HRMS → Employees**,
   open a profile, show the Dayflow tab (identity, payroll, documents,
   attendance/leave stat buttons).
2. Log in as an **Employee** → **My Profile** (own record only, payroll
   hidden), **Attendance Records** (check in/out), **Leave & Time-Off →
   Leave Requests** (apply for leave — record moves through the
   Pending → Approved/Rejected statusbar).
3. Back as Admin → **Approvals**, approve/reject the request, show the
   chatter log and the linked attendance day auto-marked "Leave".

## Notes

* Depends only on Odoo's `base`, `mail`, and `hr` modules — installs
  cleanly on a stock Odoo instance.
* Row-level security (`ir.rule`) ensures employees can only ever see
  and edit their *own* attendance and leave records; Admins see
  everything.
* Leave requests get a running reference (`LR/2026/0001`, ...) via
  `ir.sequence`, and use Odoo's chatter (`mail.thread`) for the
  approval audit trail — no custom notification system needed.
