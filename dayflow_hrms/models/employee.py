from odoo import models, fields, api


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
        groups="dayflow_hrms.group_dayflow_admin",
    )
    dayflow_bank_account = fields.Char(
        string="Bank Account Number",
        groups="dayflow_hrms.group_dayflow_admin",
    )
    dayflow_pan = fields.Char(
        string="PAN / Tax ID",
        groups="dayflow_hrms.group_dayflow_admin",
    )

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

    @api.depends('dayflow_attendance_ids', 'dayflow_leave_ids',
                 'dayflow_leave_ids.state')
    def _compute_dayflow_counts(self):
        for employee in self:
            employee.dayflow_attendance_count = len(employee.dayflow_attendance_ids)
            employee.dayflow_leave_count = len(employee.dayflow_leave_ids)
            employee.dayflow_pending_leave_count = len(
                employee.dayflow_leave_ids.filtered(lambda l: l.state == 'pending')
            )

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
