import { z } from 'zod';

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const dayKeyRegex = /^[1-7]$/;
const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

// ==================== Sub-schemas ====================

const daySchedule = z.object({
  start: z.string().regex(timeRegex),
  end: z.string().regex(timeRegex),
  lateToleranceMinutes: z.number().int().min(0).default(0),
  earlyLeaveToleranceMinutes: z.number().int().min(0).default(0),
});

const workScheduleSchema = z.record(z.string().regex(dayKeyRegex), daySchedule);

const departmentLocationSchema = z.object({
  name: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive().max(100000),
});

const departmentSchema = z.object({
  name: z.string().min(2).max(100),
  workSchedule: workScheduleSchema,
  locations: z.array(departmentLocationSchema).default([]),
});

const leaveTypeSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[A-Z0-9_]+$/, 'Sadece büyük harf, sayı ve _ kullanılabilir'),
  name: z.string().min(2).max(100),
  defaultQuota: z.number().int().min(0).max(365),
  isPaid: z.boolean().default(true),
});

const customHolidaySchema = z.object({
  name: z.string().min(2).max(150),
  date: z.string().regex(dateOnlyRegex),
  isRecurring: z.boolean().default(false),
});

const shiftBreakSchema = z.object({
  name: z.string().min(1),
  startTime: z.string().regex(timeRegex),
  endTime: z.string().regex(timeRegex),
  durationMinutes: z.number().int().min(1),
  isPaid: z.boolean().default(false),
  isAutomatic: z.boolean().default(true),
});

const graceMinutesSchema = z.object({
  lateArrival: z.number().int().min(0).default(0),
  earlyDeparture: z.number().int().min(0).default(0),
  earlyCheckIn: z.number().int().min(0).default(30),
  lateCheckOut: z.number().int().min(0).default(30),
});

const shiftDefinitionSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20),
  color: z.string().regex(hexColorRegex).default('#4CAF50'),
  startTime: z.string().regex(timeRegex),
  endTime: z.string().regex(timeRegex),
  isOvernight: z.boolean().default(false),
  netWorkingMinutes: z.number().int().min(1).max(24 * 60),
  breaks: z.array(shiftBreakSchema).default([]),
  graceMinutes: graceMinutesSchema.optional(),
  scope: z.enum(['SHARED', 'DEPARTMENTAL']).default('SHARED'),
  departmentIndices: z.array(z.number().int().min(0)).default([]),
});

// Per-org toggleable features. Mirrors the backend's `ACTIVE_FEATURE_CODES`
// (CARI_MANAGEMENT was split into 5 specific codes on 2026-04-25 and is
// excluded — see backend schema.prisma OrgFeatureCode enum).
export const FEATURE_CODES = [
  // Operational
  'LEAVE_MANAGEMENT',
  'SHIFT_MANAGEMENT',
  'HOLIDAY_MANAGEMENT',
  'ATTENDANCE_HISTORY',
  'GPS_TRACKING',
  // Communication
  'NOTIFICATION_MANAGEMENT',
  // Requests / employee-side
  'ADVANCE_MANAGEMENT',
  'EXPENSE_MANAGEMENT',
  'PAYROLL_INFO',
  // Finance (was CARI_MANAGEMENT — split for granular control)
  'SALARY_MANAGEMENT',
  'ICRA_MANAGEMENT',
  'ACCRUAL_MANAGEMENT',
  'PAYMENT_MANAGEMENT',
  'LEDGER_MANAGEMENT',
  // Reporting / oversight
  'REPORTS',
  'AUDIT_LOGS',
] as const;

export type FeatureCode = (typeof FEATURE_CODES)[number];

const featuresOverrideSchema = z
  .object(
    Object.fromEntries(FEATURE_CODES.map((c) => [c, z.boolean().optional()])) as Record<
      FeatureCode,
      z.ZodOptional<z.ZodBoolean>
    >
  )
  .partial();

// ==================== Top-level payload ====================

export const bootstrapOrganizationSchema = z.object({
  organization: z.object({
    name: z.string().min(2).max(150),
    companyCode: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[A-Z0-9]+$/, 'Sadece büyük harf ve sayı kullanılabilir'),
    contactEmail: z.string().email(),
    contactPhone: z.string().min(8).max(20).optional().or(z.literal('')),
    addressStreet: z.string().max(255).optional().or(z.literal('')),
    addressCity: z.string().max(100).optional().or(z.literal('')),
    addressCountry: z.string().max(100).default('Turkiye'),
    planCode: z.enum(['BASIC', 'PRO']),
    planDurationDays: z.number().int().min(1).max(3650).default(365),
    settings: z
      .object({
        timezone: z.string().default('Europe/Istanbul'),
        language: z.string().default('tr'),
      })
      .partial()
      .optional(),
    logo: z.string().url().optional().or(z.literal('')).optional(),
  }),
  admin: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    phone: z.string().min(8).max(20),
    password: z.string().min(6).max(72),
    isAttendanceExempt: z.boolean().default(true),
  }),
  departments: z.array(departmentSchema).default([]),
  leaveTypes: z.array(leaveTypeSchema).default([]),
  holidays: z.object({
    seedDefaults: z.boolean().default(true),
    custom: z.array(customHolidaySchema).default([]),
  }),
  shifts: z.array(shiftDefinitionSchema).default([]),
  features: featuresOverrideSchema.optional(),
});

export type BootstrapInput = z.infer<typeof bootstrapOrganizationSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type LeaveTypeInput = z.infer<typeof leaveTypeSchema>;
export type CustomHolidayInput = z.infer<typeof customHolidaySchema>;
export type ShiftInput = z.infer<typeof shiftDefinitionSchema>;
export type ShiftBreakInput = z.infer<typeof shiftBreakSchema>;
