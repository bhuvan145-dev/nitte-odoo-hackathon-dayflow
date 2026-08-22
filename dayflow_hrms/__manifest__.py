{
    'name': 'Dayflow HRMS',
    'version': '17.0.1.0.0',
    'category': 'Human Resources',
    'summary': 'Every workday, perfectly aligned.',
    'description': """
Dayflow - Human Resource Management System
============================================
A native Odoo module covering:

* Employee profile management (extends hr.employee)
* Daily / weekly attendance tracking with check-in and check-out
* Leave & time-off requests with a Pending / Approved / Rejected
  approval workflow for HR / Admin
* Payroll visibility: read-only for employees, full control for Admin
* Role-based dashboards and menus for Admin vs Employee

Built entirely on native Odoo architecture (Python ORM, QWeb/XML views,
PostgreSQL via the ORM) - no external frontend stack.
""",
    'author': 'Dayflow Team',
    'website': 'https://www.dayflow.example',
    'license': 'LGPL-3',
    'depends': ['base', 'mail', 'hr'],
    'data': [
        'security/hr_security.xml',
        'security/ir.model.access.csv',
        'data/dayflow_sequence.xml',
        'views/employee_views.xml',
        'views/attendance_views.xml',
        'views/leave_views.xml',
        'views/menus.xml',
    ],
    'application': True,
    'installable': True,
    'auto_install': False,
}
