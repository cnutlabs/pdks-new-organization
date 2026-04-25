'use client';

import { Field } from '../Field';
import type { BootstrapInput, LeaveTypeInput } from '@/lib/schema';
import { DEFAULT_LEAVE_TYPES } from '@/lib/initialState';

interface Props {
  value: BootstrapInput['leaveTypes'];
  errors: Record<string, string>;
  onChange: (next: BootstrapInput['leaveTypes']) => void;
}

export function LeaveTypesStep({ value, errors, onChange }: Props) {
  const add = () => {
    const lt: LeaveTypeInput = { code: '', name: '', defaultQuota: 1, isPaid: true };
    onChange([...value, lt]);
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const update = (idx: number, patch: Partial<LeaveTypeInput>) => {
    onChange(value.map((lt, i) => (i === idx ? { ...lt, ...patch } : lt)));
  };

  const restoreDefaults = () => {
    onChange(DEFAULT_LEAVE_TYPES.slice());
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">İzin Türleri</h2>
        <p className="text-sm text-slate-500">
          Hiç eklemezseniz varsayılan 3 izin türü (Yıllık 14, Mazeret 5, Hastalık 10)
          oluşturulur. Direktör için bu kotalarda bakiye otomatik açılır.
        </p>
      </div>

      <div className="space-y-3">
        {value.map((lt, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-slate-50 p-3 rounded border border-slate-200"
          >
            <Field label="Kod" required error={errors[`leaveTypes.${idx}.code`]}>
              <input
                className="input uppercase font-mono"
                value={lt.code}
                onChange={(e) =>
                  update(idx, {
                    code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
                  })
                }
                placeholder="YILLIK"
              />
            </Field>
            <Field label="Ad" required error={errors[`leaveTypes.${idx}.name`]}>
              <input
                className="input"
                value={lt.name}
                onChange={(e) => update(idx, { name: e.target.value })}
                placeholder="Yıllık İzin"
              />
            </Field>
            <Field label="Yıllık Kota (gün)" required error={errors[`leaveTypes.${idx}.defaultQuota`]}>
              <input
                type="number"
                min={0}
                max={365}
                className="input"
                value={lt.defaultQuota}
                onChange={(e) => update(idx, { defaultQuota: Number(e.target.value) })}
              />
            </Field>
            <Field label="Ücretli">
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={lt.isPaid}
                  onChange={(e) => update(idx, { isPaid: e.target.checked })}
                />
                <span className="text-sm">Ücretli izin</span>
              </label>
            </Field>
            <button type="button" onClick={() => remove(idx)} className="btn-danger">
              Sil
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={add} className="btn-primary">
          + İzin Türü Ekle
        </button>
        <button type="button" onClick={restoreDefaults} className="btn-secondary">
          Varsayılanları Yükle
        </button>
        <button type="button" onClick={() => onChange([])} className="btn-secondary">
          Listeyi Temizle (varsayılanları kullan)
        </button>
      </div>
    </div>
  );
}
