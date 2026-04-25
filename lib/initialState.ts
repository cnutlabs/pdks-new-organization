import type { BootstrapInput } from './schema';

export const DEFAULT_LEAVE_TYPES = [
  { code: 'YILLIK', name: 'Yillik Izin', defaultQuota: 14, isPaid: true },
  { code: 'MAZERET', name: 'Mazeret Izni', defaultQuota: 5, isPaid: true },
  { code: 'HASTALIK', name: 'Hastalik Izni', defaultQuota: 10, isPaid: true },
];

export const STANDARD_WORK_SCHEDULE = {
  '1': { start: '09:00', end: '18:00', lateToleranceMinutes: 0, earlyLeaveToleranceMinutes: 0 },
  '2': { start: '09:00', end: '18:00', lateToleranceMinutes: 0, earlyLeaveToleranceMinutes: 0 },
  '3': { start: '09:00', end: '18:00', lateToleranceMinutes: 0, earlyLeaveToleranceMinutes: 0 },
  '4': { start: '09:00', end: '18:00', lateToleranceMinutes: 0, earlyLeaveToleranceMinutes: 0 },
  '5': { start: '09:00', end: '18:00', lateToleranceMinutes: 0, earlyLeaveToleranceMinutes: 0 },
};

export const initialFormState: BootstrapInput = {
  organization: {
    name: '',
    companyCode: '',
    contactEmail: '',
    contactPhone: '',
    addressStreet: '',
    addressCity: '',
    addressCountry: 'Turkiye',
    planCode: 'PRO',
    planDurationDays: 365,
    settings: { timezone: 'Europe/Istanbul', language: 'tr' },
    logo: '',
  },
  admin: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    isAttendanceExempt: true,
  },
  departments: [],
  leaveTypes: DEFAULT_LEAVE_TYPES.slice(),
  holidays: { seedDefaults: true, custom: [] },
  shifts: [],
  features: {
    // Operational
    LEAVE_MANAGEMENT: true,
    SHIFT_MANAGEMENT: true,
    HOLIDAY_MANAGEMENT: true,
    ATTENDANCE_HISTORY: true,
    GPS_TRACKING: true,
    // Communication
    NOTIFICATION_MANAGEMENT: true,
    // Requests / employee-side
    ADVANCE_MANAGEMENT: true,
    EXPENSE_MANAGEMENT: true,
    PAYROLL_INFO: true,
    // Finance
    SALARY_MANAGEMENT: true,
    ICRA_MANAGEMENT: true,
    ACCRUAL_MANAGEMENT: true,
    PAYMENT_MANAGEMENT: true,
    LEDGER_MANAGEMENT: true,
    // Reporting / oversight
    REPORTS: true,
    AUDIT_LOGS: true,
  },
};
