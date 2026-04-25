'use client';

import { Field } from '../Field';
import type { BootstrapInput } from '@/lib/schema';

interface Props {
  value: BootstrapInput['organization'];
  errors: Record<string, string>;
  onChange: (next: BootstrapInput['organization']) => void;
}

export function OrganizationStep({ value, errors, onChange }: Props) {
  const set = <K extends keyof BootstrapInput['organization']>(
    key: K,
    v: BootstrapInput['organization'][K]
  ) => onChange({ ...value, [key]: v });

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Organizasyon Bilgileri</h2>
      <p className="text-sm text-slate-500">
        Yeni kurulacak organizasyonun temel bilgilerini girin.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Şirket Adı" required error={errors['organization.name']}>
          <input
            className="input"
            value={value.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Örn: Acme Lojistik A.Ş."
          />
        </Field>

        <Field
          label="Şirket Kodu"
          required
          error={errors['organization.companyCode']}
          helper="Sadece BÜYÜK harf ve rakam (3-20 karakter). Login için kullanılır."
        >
          <input
            className="input uppercase"
            value={value.companyCode}
            onChange={(e) =>
              set('companyCode', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
            }
            placeholder="ACME01"
          />
        </Field>

        <Field
          label="İletişim E-postası"
          required
          error={errors['organization.contactEmail']}
        >
          <input
            type="email"
            className="input"
            value={value.contactEmail}
            onChange={(e) => set('contactEmail', e.target.value)}
            placeholder="info@acme.com"
          />
        </Field>

        <Field label="İletişim Telefonu" error={errors['organization.contactPhone']}>
          <input
            className="input"
            value={value.contactPhone || ''}
            onChange={(e) => set('contactPhone', e.target.value)}
            placeholder="+90 555 123 45 67"
          />
        </Field>

        <Field label="Adres (Sokak)" error={errors['organization.addressStreet']}>
          <input
            className="input"
            value={value.addressStreet || ''}
            onChange={(e) => set('addressStreet', e.target.value)}
          />
        </Field>

        <Field label="Şehir" error={errors['organization.addressCity']}>
          <input
            className="input"
            value={value.addressCity || ''}
            onChange={(e) => set('addressCity', e.target.value)}
            placeholder="İstanbul"
          />
        </Field>

        <Field label="Ülke">
          <input
            className="input"
            value={value.addressCountry}
            onChange={(e) => set('addressCountry', e.target.value)}
          />
        </Field>

        <Field label="Logo URL" error={errors['organization.logo']}>
          <input
            className="input"
            value={value.logo || ''}
            onChange={(e) => set('logo', e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <Field label="Plan" required error={errors['organization.planCode']}>
          <select
            className="input"
            value={value.planCode}
            onChange={(e) => set('planCode', e.target.value as 'BASIC' | 'PRO')}
          >
            <option value="BASIC">Basic (25 kullanıcı, 3 departman)</option>
            <option value="PRO">Pro (100 kullanıcı, 15 departman)</option>
          </select>
        </Field>

        <Field
          label="Plan Süresi (gün)"
          required
          error={errors['organization.planDurationDays']}
        >
          <input
            type="number"
            min={1}
            max={3650}
            className="input"
            value={value.planDurationDays}
            onChange={(e) => set('planDurationDays', Number(e.target.value))}
          />
        </Field>

        <Field label="Saat Dilimi">
          <input
            className="input"
            value={value.settings?.timezone || 'Europe/Istanbul'}
            onChange={(e) =>
              onChange({
                ...value,
                settings: { ...value.settings, timezone: e.target.value },
              })
            }
          />
        </Field>

        <Field label="Dil">
          <input
            className="input"
            value={value.settings?.language || 'tr'}
            onChange={(e) =>
              onChange({
                ...value,
                settings: { ...value.settings, language: e.target.value },
              })
            }
          />
        </Field>
      </div>
    </div>
  );
}
