from odoo import models, fields, api
from odoo.exceptions import UserError


class DayflowAttendance(models.Model):
    _name = 'dayflow.attendance'
    _description = 'Dayflow Attendance Record'
    _order = 'check_in desc, id desc'

    employee_id = fields.Many2one(
        'hr.employee', string="Employee", required=True, ondelete='cascade',
        default=lambda self: self.env.user.employee_id,
        index=True,
    )
    date = fields.Date(
        string="Date", compute='_compute_date', store=True, index=True)
    check_in = fields.Datetime(string="Check In")
    check_out = fields.Datetime(string="Check Out")
    worked_hours = fields.Float(
        string="Worked Hours", compute='_compute_worked_hours', store=True)
    status = fields.Selection(
        [
            ('present', 'Present'),
            ('absent', 'Absent'),
            ('half_day', 'Half Day'),
            ('leave', 'Leave'),
        ],
        string="Status", default='present', required=True, tracking=True,
    )
    note = fields.Char(string="Note")

    _sql_constraints = [
        ('unique_employee_date',
         'unique(employee_id, date)',
         'An attendance record already exists for this employee on this date.'),
    ]

    @api.depends('check_in')
    def _compute_date(self):
        for rec in self:
            rec.date = rec.check_in.date() if rec.check_in else fields.Date.context_today(rec)

    @api.depends('check_in', 'check_out')
    def _compute_worked_hours(self):
        for rec in self:
            if rec.check_in and rec.check_out:
                delta = rec.check_out - rec.check_in
                rec.worked_hours = delta.total_seconds() / 3600.0
            else:
                rec.worked_hours = 0.0

    def action_check_in(self):
        for rec in self:
            if rec.check_in:
                raise UserError("This record is already checked in.")
            rec.check_in = fields.Datetime.now()
            rec.status = 'present'

    def action_check_out(self):
        for rec in self:
            if not rec.check_in:
                raise UserError("Please check in before checking out.")
            if rec.check_out:
                raise UserError("This record is already checked out.")
            rec.check_out = fields.Datetime.now()

    @api.model
    def dayflow_quick_check_in(self):
        """Convenience method for a single 'Check In' dashboard button:
        creates (or reuses) today's record for the current user and
        stamps the check-in time."""
        employee = self.env.user.employee_id
        if not employee:
            raise UserError("No employee record is linked to your user account.")
        today = fields.Date.context_today(self)
        record = self.search(
            [('employee_id', '=', employee.id), ('date', '=', today)], limit=1)
        if record:
            if not record.check_in:
                record.action_check_in()
            return record
        return self.create({
            'employee_id': employee.id,
            'check_in': fields.Datetime.now(),
        })
