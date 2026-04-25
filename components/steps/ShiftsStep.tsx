'use client';

import { Field } from '../Field';
import type { BootstrapInput, ShiftInput } from '@/lib/schema';

interface Props {
  value: BootstrapInput['shifts'];
  errors: Record<string, string>;
  onChange: (next: BootstrapInput['shifts']) => void;
  departments: BootstrapInput['departments'];
}

export function ShiftsStep({ value, errors, onChange, departments }: Props) {
  const add = () => {
    const s: ShiftInput = {
      name: '',
      code: '',
      color: '#4CAF50',
      startTime: '09:00',
      endTime: '18:00',
      isOvernight: false,
      netWorkingMinutes: 480,
      breaks: [],
      graceMinutes: { lateArrival: 0, earlyDeparture: 0, earlyCheckIn: 30, lateCheckOut: 30 },
      scope: 'SHARED',
      departmentIndices: [],
    };
    onChange([...value, s]);
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  const update = (idx: number, patch: Partial<ShiftInput>) =>
    onChange(value.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const toggleDept = (shiftIdx: number, deptIdx: number) => {
    const s = value[shiftIdx];
    const set = new Set(s.departmentIndices);
    if (set.has(deptIdx)) set.delete(deptIdx);
    else set.add(deptIdx);
    update(shiftIdx, { departmentIndices: Array.from(set).sort((a, b) => a - b) });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Vardiya Tanımları (opsiyonel)</h2>
        <p className="text-sm text-slate-500">
          Vardiya kullanmıyorsanız bu adımı atlayabilirsiniz. Atlandığında departman çalışma
          saatleri kullanılır.
        </p>
      </div>

      <div className="space-y-4">
        {value.map((s, idx) => (
          <div key={idx} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Ad" required error={errors[`shifts.${idx}.name`]}>
                <input
                  className="input"
                  value={s.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  placeholder="Gündüz Vardiyası"
                />
              </Field>
              <Field label="Kod" required error={errors[`shifts.${idx}.code`]}>
                <input
                  className="input uppercase font-mono"
                  value={s.code}
                  onChange={(e) =>
                    update(idx, { code: e.target.value.toUpperCase() })
                  }
                  placeholder="GUNDUZ"
                />
              </Field>
              <Field label="Renk">
                <input
                  type="color"
                  className="input h-10 p-1"
                  value={s.color}
                  onChange={(e) => update(idx, { color: e.target.value })}
                />
              </Field>

              <Field label="Başlangıç" required error={errors[`shifts.${idx}.startTime`]}>
                <input
                  type="time"
                  className="input"
                  value={s.startTime}
                  onChange={(e) => update(idx, { startTime: e.target.value })}
                />
              </Field>
              <Field label="Bitiş" required error={errors[`shifts.${idx}.endTime`]}>
                <input
                  type="time"
                  className="input"
                  value={s.endTime}
                  onChange={(e) => update(idx, { endTime: e.target.value })}
                />
              </Field>
              <Field
                label="Net Çalışma (dk)"
                required
                error={errors[`shifts.${idx}.netWorkingMinutes`]}
                helper="Molalar düşülmüş net çalışma süresi"
              >
                <input
                  type="number"
                  min={1}
                  max={1440}
                  className="input"
                  value={s.netWorkingMinutes}
                  onChange={(e) =>
                    update(idx, { netWorkingMinutes: Number(e.target.value) })
                  }
                />
              </Field>

              <Field label="Gece Vardiyası">
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={s.isOvernight}
                    onChange={(e) => update(idx, { isOvernight: e.target.checked })}
                  />
                  <span className="text-sm">Cross-midnight (örn 22:00→06:00)</span>
                </label>
              </Field>

              <Field label="Kapsam" required>
                <select
                  className="input"
                  value={s.scope}
                  onChange={(e) =>
                    update(idx, { scope: e.target.value as 'SHARED' | 'DEPARTMENTAL' })
                  }
                >
                  <option value="SHARED">SHARED — Tüm organizasyon</option>
                  <option value="DEPARTMENTAL">DEPARTMENTAL — Belirli departmanlar</option>
                </select>
              </Field>
            </div>

            {s.scope === 'DEPARTMENTAL' && (
              <div className="mt-3">
                <p className="label">Bağlı Departmanlar</p>
                {departments.length === 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                    Henüz departman eklenmedi. Bu vardiya kaydedilmeden önce en az 1 departman
                    eklemeli ve seçmelisiniz.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {departments.map((d, di) => {
                      const checked = s.departmentIndices.includes(di);
                      return (
                        <label
                          key={di}
                          className={[
                            'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs cursor-pointer',
                            checked
                              ? 'bg-brand-100 border-brand-500 text-brand-700'
                              : 'bg-white border-slate-300',
                          ].join(' ')}
                        >
                          <input
                            type="checkbox"
                            className="h-3 w-3"
                            checked={checked}
                            onChange={() => toggleDept(idx, di)}
                          />
                          {d.name || `Departman #${di + 1}`}
                        </label>
                      );
                    })}
                  </div>
                )}
                {errors[`shifts.${idx}.departmentIndices`] && (
                  <p className="error-text">{errors[`shifts.${idx}.departmentIndices`]}</p>
                )}
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <button type="button" onClick={() => remove(idx)} className="btn-danger">
                Vardiyayı Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={add} className="btn-primary">
        + Vardiya Ekle
      </button>
    </div>
  );
}
