from odoo import models, fields, api
from odoo.exceptions import UserError

DAYFLOW_PAYROLL_FIELDS = (
    'currency_id', 'dayflow_salary', 'dayflow_bank_account', 'dayflow_pan',
)


class HrEmployeeDayflow(models.Model):
    """Extends the native hr.employee model with the fields Dayflow
    needs for profile management, documents and payroll visibility,
    instead of duplicating employee data in a parallel model."""
    _inherit = 'hr.employee'

    dayflow_code = fields.Char(
        string="Dayflow Employee ID",
        copy=False,
        help="Unique identifier used at Sign Up and shown across the "
             "Dayflow dashboard.",
    )
    dayflow_role = fields.Selection(
        [('employee', 'Employee'), ('admin', 'HR Officer / Admin')],
        string="Dayflow Role",
        default='employee',
        tracking=True,
        help="Mirrors the role chosen at Sign Up (Employee / HR).",
    )

    # --- Payroll -----------------------------------------------------
    currency_id = fields.Many2one(
        'res.currency', string="Currency",
        default=lambda self: self.env.company.currency_id,
    )
    dayflow_salary = fields.Monetary(
        string="Monthly Salary", currency_field='currency_id',
        readonly=True,
    )
    dayflow_bank_account = fields.Char(
        string="Bank Account Number",
        readonly=True,
    )
    dayflow_pan = fields.Char(
        string="PAN / Tax ID",
        readonly=True,
    )

    def write(self, vals):
        """Payroll data is read-only for employees: only Admin/HR may
        update salary structure (PDF 3.6)."""
        if set(vals) & set(DAYFLOW_PAYROLL_FIELDS) and not self.env.user.has_group(
                'dayflow_hrms.group_dayflow_admin'):
            raise UserError("Only HR Officers / Admins can modify payroll details.")
        return super().write(vals)

    # --- Documents -----------------------------------------------------
    dayflow_document_ids = fields.Many2many(
        'ir.attachment', string="Documents",
        help="ID proofs, contracts, certificates, etc.",
    )

    # --- Dashboard summary --------------------------------------------
    dayflow_attendance_ids = fields.One2many(
        'dayflow.attendance', 'employee_id', string="Attendance Records")
    dayflow_leave_ids = fields.One2many(
        'dayflow.leave.request', 'employee_id', string="Leave Requests")

    dayflow_attendance_count = fields.Integer(
        string="Attendance Records", compute='_compute_dayflow_counts')
    dayflow_leave_count = fields.Integer(
        string="Leave Requests", compute='_compute_dayflow_counts')
    dayflow_pending_leave_count = fields.Integer(
        string="Pending Leave Requests", compute='_compute_dayflow_counts')

    # --- Today snapshot for the dashboard -----------------------------
    dayflow_is_checked_in = fields.Boolean(
        string="Checked In Today", compute='_compute_dayflow_today')
    dayflow_today_check_in = fields.Datetime(
        string="Today Check In", compute='_compute_dayflow_today')
    dayflow_today_check_out = fields.Datetime(
        string="Today Check Out", compute='_compute_dayflow_today')
    dayflow_today_worked_hours = fields.Float(
        string="Today Worked Hours", compute='_compute_dayflow_today')
    dayflow_alerts = fields.Text(
        string="Alerts", compute='_compute_dayflow_alerts')

    @api.depends('dayflow_attendance_ids', 'dayflow_leave_ids',
                 'dayflow_leave_ids.state')
    def _compute_dayflow_counts(self):
        for employee in self:
            employee.dayflow_attendance_count = len(employee.dayflow_attendance_ids)
            employee.dayflow_leave_count = len(employee.dayflow_leave_ids)
            employee.dayflow_pending_leave_count = len(
                employee.dayflow_leave_ids.filtered(lambda l: l.state == 'pending')
            )

    def _get_today_attendance(self):
        self.ensure_one()
        return self.env['dayflow.attendance'].search([
            ('employee_id', '=', self.id),
            ('date', '=', fields.Date.context_today(self)),
        ], limit=1)

    @api.depends('dayflow_attendance_ids.check_in',
                 'dayflow_attendance_ids.check_out',
                 'dayflow_attendance_ids.worked_hours')
    def _compute_dayflow_today(self):
        for employee in self:
            record = employee._get_today_attendance()
            employee.dayflow_today_check_in = record.check_in if record else False
            employee.dayflow_today_check_out = record.check_out if record else False
            employee.dayflow_today_worked_hours = record.worked_hours if record else 0.0
            employee.dayflow_is_checked_in = bool(
                record and record.check_in and not record.check_out)

    @api.depends('dayflow_pending_leave_count', 'dayflow_is_checked_in')
    def _compute_dayflow_alerts(self):
        for employee in self:
            alerts = []
            if not employee._get_today_attendance():
                alerts.append("You have not checked in today.")
            pending = employee.dayflow_pending_leave_count
            if pending:
                alerts.append(
                    f"{pending} leave request(s) awaiting review.")
            employee.dayflow_alerts = "\n".join(alerts) or "All clear!"

    def action_dayflow_view_pending_leaves(self):
        self.ensure_one()
        action = self.env['ir.actions.act_window']._for_xml_id(
            'dayflow_hrms.action_dayflow_leave_request')
        action['domain'] = [
            ('employee_id', '=', self.id), ('state', '=', 'pending')]
        return action

    def action_dayflow_check_in_out(self):
        """Dashboard toggle button: check in when out, check out when in."""
        self.ensure_one()
        attendance = self.env['dayflow.attendance']
        if self.dayflow_is_checked_in:
            attendance.dayflow_quick_check_out()
        else:
            attendance.dayflow_quick_check_in()
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'hr.employee',
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'current',
        }

    def action_dayflow_view_attendance(self):
        self.ensure_one()
        action = self.env['ir.actions.act_window']._for_xml_id(
            'dayflow_hrms.action_dayflow_attendance')
        action['domain'] = [('employee_id', '=', self.id)]
        action['context'] = {'default_employee_id': self.id}
        return action

    def action_dayflow_view_leaves(self):
        self.ensure_one()
        action = self.env['ir.actions.act_window']._for_xml_id(
            'dayflow_hrms.action_dayflow_leave_request')
        action['domain'] = [('employee_id', '=', self.id)]
        action['context'] = {'default_employee_id': self.id}
        return action
