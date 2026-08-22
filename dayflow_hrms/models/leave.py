from odoo import models, fields, api
from odoo.exceptions import UserError


class DayflowLeaveRequest(models.Model):
    _name = 'dayflow.leave.request'
    _description = 'Dayflow Leave / Time-Off Request'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(
        string="Reference", default="New", copy=False, readonly=True)
    employee_id = fields.Many2one(
        'hr.employee', string="Employee", required=True, tracking=True,
        default=lambda self: self.env.user.employee_id,
        index=True,
    )
    leave_type = fields.Selection(
        [
            ('paid', 'Paid Leave'),
            ('sick', 'Sick Leave'),
            ('unpaid', 'Unpaid Leave'),
        ],
        string="Leave Type", required=True, tracking=True,
    )
    date_from = fields.Date(string="From", required=True, tracking=True)
    date_to = fields.Date(string="To", required=True, tracking=True)
    number_of_days = fields.Integer(
        string="Days", compute='_compute_days', store=True)
    remarks = fields.Text(string="Remarks")
    admin_comment = fields.Text(string="Admin Comment")
    state = fields.Selection(
        [
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        string="Status", default='pending', tracking=True, index=True,
    )
    approver_id = fields.Many2one(
        'res.users', string="Reviewed By", readonly=True, copy=False)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code(
                    'dayflow.leave.request') or 'New'
        return super().create(vals_list)

    @api.depends('date_from', 'date_to')
    def _compute_days(self):
        for rec in self:
            if rec.date_from and rec.date_to and rec.date_to >= rec.date_from:
                rec.number_of_days = (rec.date_to - rec.date_from).days + 1
            else:
                rec.number_of_days = 0

    @api.constrains('date_from', 'date_to')
    def _check_dates(self):
        for rec in self:
            if rec.date_from and rec.date_to and rec.date_to < rec.date_from:
                raise UserError("The end date cannot be before the start date.")

    def action_approve(self):
        for rec in self:
            rec.write({'state': 'approved', 'approver_id': self.env.user.id})
            rec.message_post(body="Leave request approved.")
            # Mark the matching attendance days as 'leave' if they exist.
            attendances = self.env['dayflow.attendance'].search([
                ('employee_id', '=', rec.employee_id.id),
                ('date', '>=', rec.date_from),
                ('date', '<=', rec.date_to),
            ])
            attendances.write({'status': 'leave'})

    def action_reject(self):
        for rec in self:
            rec.write({'state': 'rejected', 'approver_id': self.env.user.id})
            rec.message_post(body="Leave request rejected.")
