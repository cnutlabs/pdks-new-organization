'use client';

import { Field } from '../Field';
import type { BootstrapInput } from '@/lib/schema';

interface Props {
  value: BootstrapInput['admin'];
  errors: Record<string, string>;
  onChange: (next: BootstrapInput['admin']) => void;
}

export function AdminStep({ value, errors, onChange }: Props) {
  const set = <K extends keyof BootstrapInput['admin']>(
    key: K,
    v: BootstrapInput['admin'][K]
  ) => onChange({ ...value, [key]: v });

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Direktör (Süper Yönetici)</h2>
      <p className="text-sm text-slate-500">
        Organizasyonun ilk kullanıcısı — direktör (tam yetkili) rolünde oluşturulur. Diğer
        personeli daha sonra panelden ekleyebilirsiniz.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Ad" required error={errors['admin.firstName']}>
          <input
            className="input"
            value={value.firstName}
            onChange={(e) => set('firstName', e.target.value)}
          />
        </Field>

        <Field label="Soyad" required error={errors['admin.lastName']}>
          <input
            className="input"
            value={value.lastName}
            onChange={(e) => set('lastName', e.target.value)}
          />
        </Field>

        <Field label="E-posta" required error={errors['admin.email']}>
          <input
            type="email"
            className="input"
            value={value.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="admin@acme.com"
          />
        </Field>

        <Field
          label="Telefon"
          required
          error={errors['admin.phone']}
          helper="Sistem genelinde benzersiz olmalı. Login için kullanılabilir."
        >
          <input
            className="input"
            value={value.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+905551234567"
          />
        </Field>

        <Field
          label="Şifre"
          required
          error={errors['admin.password']}
          helper="En az 6 karakter. İlk girişten sonra değiştirilebilir."
        >
          <input
            type="text"
            className="input font-mono"
            value={value.password}
            onChange={(e) => set('password', e.target.value)}
          />
        </Field>

        <Field label="Devam Kontrol Muafiyeti">
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={value.isAttendanceExempt}
              onChange={(e) => set('isAttendanceExempt', e.target.checked)}
            />
            <span className="text-sm text-slate-700">
              Direktör check-in/out yapmasın (önerilen: işaretli)
            </span>
          </label>
        </Field>
      </div>
    </div>
  );
}
