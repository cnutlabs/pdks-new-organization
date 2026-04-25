'use client';

import { useState } from 'react';
import { z } from 'zod';
import { bootstrapOrganizationSchema, type BootstrapInput } from '@/lib/schema';
import { initialFormState } from '@/lib/initialState';
import { StepIndicator } from '@/components/StepIndicator';
import { OrganizationStep } from '@/components/steps/OrganizationStep';
import { AdminStep } from '@/components/steps/AdminStep';
import { DepartmentsStep } from '@/components/steps/DepartmentsStep';
import { LeaveTypesStep } from '@/components/steps/LeaveTypesStep';
import { HolidaysStep } from '@/components/steps/HolidaysStep';
import { ShiftsStep } from '@/components/steps/ShiftsStep';
import { FeaturesStep } from '@/components/steps/FeaturesStep';
import { ReviewStep } from '@/components/steps/ReviewStep';

const STEPS = [
  'Organizasyon',
  'Direktör',
  'Departmanlar',
  'İzin Türleri',
  'Tatiller',
  'Vardiyalar',
  'Özellikler',
  'Onay',
];

interface SubmitResult {
  organization: { id: string; name: string; companyCode: string };
  admin: { id: string; email: string; employeeId: string };
  counts: Record<string, number>;
}

export default function Page() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BootstrapInput>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateStep = (idx: number): boolean => {
    // Validate the relevant slice of the schema for the current step.
    // We use safeParse on focused sub-schemas to give per-step feedback.
    const fieldErrors: Record<string, string> = {};

    const tryParse = <T extends z.ZodTypeAny>(schema: T, value: unknown, prefix: string) => {
      const parsed = schema.safeParse(value);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const path = [prefix, ...issue.path].filter((x) => x !== '').join('.');
          if (!fieldErrors[path]) fieldErrors[path] = issue.message;
        }
        return false;
      }
      return true;
    };

    let ok = true;
    if (idx === 0) {
      ok = tryParse(bootstrapOrganizationSchema.shape.organization, data.organization, 'organization');
    } else if (idx === 1) {
      ok = tryParse(bootstrapOrganizationSchema.shape.admin, data.admin, 'admin');
    } else if (idx === 2) {
      ok = tryParse(bootstrapOrganizationSchema.shape.departments, data.departments, 'departments');
    } else if (idx === 3) {
      ok = tryParse(bootstrapOrganizationSchema.shape.leaveTypes, data.leaveTypes, 'leaveTypes');
    } else if (idx === 4) {
      ok = tryParse(bootstrapOrganizationSchema.shape.holidays, data.holidays, 'holidays');
    } else if (idx === 5) {
      ok = tryParse(bootstrapOrganizationSchema.shape.shifts, data.shifts, 'shifts');
      // Cross-validate departmentIndices range
      data.shifts.forEach((s, i) => {
        if (s.scope === 'DEPARTMENTAL') {
          if (!s.departmentIndices || s.departmentIndices.length === 0) {
            fieldErrors[`shifts.${i}.departmentIndices`] =
              'En az 1 departman seçilmelidir';
            ok = false;
          }
          for (const di of s.departmentIndices ?? []) {
            if (di >= data.departments.length) {
              fieldErrors[`shifts.${i}.departmentIndices`] = 'Geçersiz departman seçimi';
              ok = false;
            }
          }
        }
      });
    } else if (idx === 6) {
      // features step — no required validation
      ok = true;
    } else if (idx === 7) {
      // Final full validation
      const parsed = bootstrapOrganizationSchema.safeParse(data);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const path = issue.path.join('.');
          if (!fieldErrors[path]) fieldErrors[path] = issue.message;
        }
        ok = false;
      }
    }

    setErrors(fieldErrors);
    return ok;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    if (!validateStep(STEPS.length - 1)) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch('/api/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(
          json?.message ||
            json?.error ||
            `Hata (${res.status}): organizasyon oluşturulamadı.`
        );
        if (Array.isArray(json?.errors)) {
          const fieldErrors: Record<string, string> = {};
          for (const e of json.errors) {
            if (e.field && e.message) fieldErrors[e.field] = e.message;
          }
          setErrors(fieldErrors);
        }
        return;
      }
      setResult(json.data as SubmitResult);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Beklenmeyen bir ağ hatası oluştu'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setData(initialFormState);
    setErrors({});
    setResult(null);
    setServerError(null);
    setStep(0);
  };

  if (result) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-2xl w-full text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold">Organizasyon başarıyla oluşturuldu</h1>
          <div className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-left text-sm">
            <p>
              <strong>Şirket:</strong> {result.organization.name} (
              <code className="font-mono">{result.organization.companyCode}</code>)
            </p>
            <p>
              <strong>Direktör:</strong> {result.admin.email} (sicil:{' '}
              <code className="font-mono">{result.admin.employeeId}</code>)
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Oluşturulanlar: {result.counts.departments} departman, {result.counts.locations}{' '}
              lokasyon, {result.counts.leaveTypes} izin türü, {result.counts.holidays} tatil,{' '}
              {result.counts.shifts} vardiya, {result.counts.features} özellik bayrağı
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Backend'in normal login akışıyla giriş yapabilirsiniz.
          </p>
          <button onClick={reset} className="btn-primary">
            Yeni Organizasyon Oluştur
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">PDKS — Yeni Organizasyon Kurulumu</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tüm bilgileri girip atomik olarak yeni bir organizasyon oluşturun.
        </p>
      </header>

      <div className="mb-6">
        <StepIndicator steps={STEPS} current={step} onJump={setStep} />
      </div>

      <div className="card">
        {step === 0 && (
          <OrganizationStep
            value={data.organization}
            errors={errors}
            onChange={(v) => setData({ ...data, organization: v })}
          />
        )}
        {step === 1 && (
          <AdminStep
            value={data.admin}
            errors={errors}
            onChange={(v) => setData({ ...data, admin: v })}
          />
        )}
        {step === 2 && (
          <DepartmentsStep
            value={data.departments}
            errors={errors}
            onChange={(v) => setData({ ...data, departments: v })}
            planCode={data.organization.planCode}
          />
        )}
        {step === 3 && (
          <LeaveTypesStep
            value={data.leaveTypes}
            errors={errors}
            onChange={(v) => setData({ ...data, leaveTypes: v })}
          />
        )}
        {step === 4 && (
          <HolidaysStep
            value={data.holidays}
            errors={errors}
            onChange={(v) => setData({ ...data, holidays: v })}
          />
        )}
        {step === 5 && (
          <ShiftsStep
            value={data.shifts}
            errors={errors}
            onChange={(v) => setData({ ...data, shifts: v })}
            departments={data.departments}
          />
        )}
        {step === 6 && (
          <FeaturesStep
            value={data.features}
            onChange={(v) => setData({ ...data, features: v })}
          />
        )}
        {step === 7 && <ReviewStep value={data} />}

        {serverError && (
          <div className="mt-6 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-2">
          <button onClick={back} disabled={step === 0} className="btn-secondary">
            ← Geri
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary">
              İleri →
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className="btn-primary">
              {submitting ? 'Oluşturuluyor…' : 'Organizasyonu Oluştur'}
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Bu araç {process.env.NEXT_PUBLIC_BACKEND_URL || 'backend'}'a bağlıdır.
      </p>
    </main>
  );
}
