'use client';

import { Field } from '../Field';
import type { BootstrapInput, CustomHolidayInput } from '@/lib/schema';

const DEFAULT_HOLIDAYS = [
  { name: 'Yılbaşı', month: 1, day: 1 },
  { name: 'Ulusal Egemenlik ve Çocuk Bayramı', month: 4, day: 23 },
  { name: 'Emek ve Dayanışma Günü', month: 5, day: 1 },
  { name: 'Atatürk’ü Anma, Gençlik ve Spor Bayramı', month: 5, day: 19 },
  { name: '15 Temmuz Demokrasi ve Milli Birlik Günü', month: 7, day: 15 },
  { name: 'Zafer Bayramı', month: 8, day: 30 },
  { name: 'Cumhuriyet Bayramı', month: 10, day: 29 },
];

interface Props {
  value: BootstrapInput['holidays'];
  errors: Record<string, string>;
  onChange: (next: BootstrapInput['holidays']) => void;
}

export function HolidaysStep({ value, errors, onChange }: Props) {
  const addCustom = () => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    const c: CustomHolidayInput = { name: '', date: iso, isRecurring: false };
    onChange({ ...value, custom: [...value.custom, c] });
  };

  const removeCustom = (idx: number) => {
    onChange({ ...value, custom: value.custom.filter((_, i) => i !== idx) });
  };

  const updateCustom = (idx: number, patch: Partial<CustomHolidayInput>) => {
    onChange({
      ...value,
      custom: value.custom.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Tatil Günleri</h2>
        <p className="text-sm text-slate-500">
          Tatil günlerinde devam kontrol kapatılır ve izinden düşülmez. Türkiye varsayılan
          ulusal tatilleri tek tıkla yüklenir.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <input
          type="checkbox"
          className="h-4 w-4 mt-1 rounded border-slate-300"
          checked={value.seedDefaults}
          onChange={(e) => onChange({ ...value, seedDefaults: e.target.checked })}
        />
        <div>
          <p className="text-sm font-medium">Türkiye varsayılan ulusal tatillerini yükle</p>
          <p className="text-xs text-slate-500 mt-1">
            {DEFAULT_HOLIDAYS.map((h) => h.name).join(', ')} — yıllık tekrarlı.
          </p>
        </div>
      </label>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="label mb-0">Özel Tatiller (opsiyonel)</p>
          <button type="button" onClick={addCustom} className="btn-secondary text-xs">
            + Özel Tatil Ekle
          </button>
        </div>
        {value.custom.length === 0 ? (
          <p className="text-xs text-slate-500">Eklenmiş özel tatil yok.</p>
        ) : (
          <div className="space-y-2">
            {value.custom.map((c, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end bg-slate-50 p-3 rounded border border-slate-200"
              >
                <Field label="İsim" required error={errors[`holidays.custom.${idx}.name`]}>
                  <input
                    className="input"
                    value={c.name}
                    onChange={(e) => updateCustom(idx, { name: e.target.value })}
                  />
                </Field>
                <Field label="Tarih" required error={errors[`holidays.custom.${idx}.date`]}>
                  <input
                    type="date"
                    className="input"
                    value={c.date}
                    onChange={(e) => updateCustom(idx, { date: e.target.value })}
                  />
                </Field>
                <Field label="Yıllık Tekrar">
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300"
                      checked={c.isRecurring}
                      onChange={(e) => updateCustom(idx, { isRecurring: e.target.checked })}
                    />
                    <span className="text-sm">Her yıl tekrarla</span>
                  </label>
                </Field>
                <button
                  type="button"
                  onClick={() => removeCustom(idx)}
                  className="btn-danger"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
