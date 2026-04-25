'use client';

import { Field } from '../Field';
import type { BootstrapInput, DepartmentInput } from '@/lib/schema';
import { STANDARD_WORK_SCHEDULE } from '@/lib/initialState';

interface Props {
  value: BootstrapInput['departments'];
  errors: Record<string, string>;
  onChange: (next: BootstrapInput['departments']) => void;
  planCode: 'BASIC' | 'PRO' | 'UNLIMITED';
}

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export function DepartmentsStep({ value, errors, onChange, planCode }: Props) {
  const add = () => {
    const dept: DepartmentInput = {
      name: '',
      workSchedule: { ...STANDARD_WORK_SCHEDULE },
      locations: [],
    };
    onChange([...value, dept]);
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const update = (idx: number, patch: Partial<DepartmentInput>) => {
    onChange(value.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const toggleDay = (deptIdx: number, day: string) => {
    const dept = value[deptIdx];
    const next = { ...dept.workSchedule };
    if (next[day]) {
      delete next[day];
    } else {
      next[day] = {
        start: '09:00',
        end: '18:00',
        lateToleranceMinutes: 0,
        earlyLeaveToleranceMinutes: 0,
      };
    }
    update(deptIdx, { workSchedule: next });
  };

  const updateDayHours = (
    deptIdx: number,
    day: string,
    field: 'start' | 'end' | 'lateToleranceMinutes' | 'earlyLeaveToleranceMinutes',
    val: string | number
  ) => {
    const dept = value[deptIdx];
    const day_ = dept.workSchedule[day];
    if (!day_) return;
    update(deptIdx, {
      workSchedule: { ...dept.workSchedule, [day]: { ...day_, [field]: val } },
    });
  };

  const addLocation = (deptIdx: number) => {
    const dept = value[deptIdx];
    update(deptIdx, {
      locations: [
        ...(dept.locations || []),
        { name: '', latitude: 41.0082, longitude: 28.9784, radius: 100 },
      ],
    });
  };

  const removeLocation = (deptIdx: number, locIdx: number) => {
    const dept = value[deptIdx];
    update(deptIdx, { locations: (dept.locations || []).filter((_, i) => i !== locIdx) });
  };

  const updateLocation = (
    deptIdx: number,
    locIdx: number,
    patch: Partial<DepartmentInput['locations'][number]>
  ) => {
    const dept = value[deptIdx];
    update(deptIdx, {
      locations: (dept.locations || []).map((l, i) => (i === locIdx ? { ...l, ...patch } : l)),
    });
  };

  const planLimit = planCode === 'UNLIMITED' ? null : planCode === 'PRO' ? 15 : 3;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Departmanlar</h2>
        <p className="text-sm text-slate-500">
          Plan limiti: {planLimit ?? 'sınırsız'} departman ({planCode}). En az 1 departman
          önerilir; boş bıraksanız da sonra ekleyebilirsiniz.
        </p>
      </div>

      <div className="space-y-4">
        {value.map((dept, idx) => (
          <div key={idx} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <Field label="Departman Adı" required error={errors[`departments.${idx}.name`]}>
                  <input
                    className="input"
                    value={dept.name}
                    onChange={(e) => update(idx, { name: e.target.value })}
                    placeholder="Yazılım Geliştirme"
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="btn-danger mt-7"
              >
                Sil
              </button>
            </div>

            <div className="mt-3">
              <p className="label">Çalışma Günleri ve Saatleri</p>
              <div className="space-y-2">
                {DAY_NAMES.map((dayName, dayIdx) => {
                  const key = String(dayIdx + 1);
                  const day_ = dept.workSchedule[key];
                  const enabled = !!day_;
                  return (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <label className="flex items-center gap-2 w-20">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300"
                          checked={enabled}
                          onChange={() => toggleDay(idx, key)}
                        />
                        <span>{dayName}</span>
                      </label>
                      {enabled && day_ && (
                        <>
                          <input
                            type="time"
                            className="input w-28"
                            value={day_.start}
                            onChange={(e) => updateDayHours(idx, key, 'start', e.target.value)}
                          />
                          <span className="text-slate-400">→</span>
                          <input
                            type="time"
                            className="input w-28"
                            value={day_.end}
                            onChange={(e) => updateDayHours(idx, key, 'end', e.target.value)}
                          />
                          <span className="text-xs text-slate-500 ml-2">Geç tolerans (dk):</span>
                          <input
                            type="number"
                            min={0}
                            className="input w-20"
                            value={day_.lateToleranceMinutes}
                            onChange={(e) =>
                              updateDayHours(
                                idx,
                                key,
                                'lateToleranceMinutes',
                                Number(e.target.value)
                              )
                            }
                          />
                          <span className="text-xs text-slate-500 ml-2">Erken çıkış (dk):</span>
                          <input
                            type="number"
                            min={0}
                            className="input w-20"
                            value={day_.earlyLeaveToleranceMinutes}
                            onChange={(e) =>
                              updateDayHours(
                                idx,
                                key,
                                'earlyLeaveToleranceMinutes',
                                Number(e.target.value)
                              )
                            }
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="label mb-0">Lokasyonlar (GPS)</p>
                <button
                  type="button"
                  onClick={() => addLocation(idx)}
                  className="btn-secondary text-xs"
                >
                  + Lokasyon Ekle
                </button>
              </div>
              {(dept.locations || []).length === 0 ? (
                <p className="text-xs text-slate-500">
                  Henüz lokasyon yok. Personel kendi konumundan check-in yaparken konum
                  doğrulaması yapılmaz.
                </p>
              ) : (
                <div className="space-y-2">
                  {(dept.locations || []).map((loc, locIdx) => (
                    <div
                      key={locIdx}
                      className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end bg-white p-3 rounded border border-slate-200"
                    >
                      <Field label="İsim" required>
                        <input
                          className="input"
                          value={loc.name}
                          onChange={(e) => updateLocation(idx, locIdx, { name: e.target.value })}
                          placeholder="Merkez Ofis"
                        />
                      </Field>
                      <Field label="Enlem">
                        <input
                          type="number"
                          step="any"
                          className="input"
                          value={loc.latitude}
                          onChange={(e) =>
                            updateLocation(idx, locIdx, { latitude: Number(e.target.value) })
                          }
                        />
                      </Field>
                      <Field label="Boylam">
                        <input
                          type="number"
                          step="any"
                          className="input"
                          value={loc.longitude}
                          onChange={(e) =>
                            updateLocation(idx, locIdx, { longitude: Number(e.target.value) })
                          }
                        />
                      </Field>
                      <Field label="Yarıçap (m)">
                        <input
                          type="number"
                          min={1}
                          className="input"
                          value={loc.radius}
                          onChange={(e) =>
                            updateLocation(idx, locIdx, { radius: Number(e.target.value) })
                          }
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() => removeLocation(idx, locIdx)}
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
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={add}
          disabled={planLimit !== null && value.length >= planLimit}
          className="btn-primary"
        >
          + Departman Ekle
        </button>
        {planLimit !== null && value.length >= planLimit && (
          <span className="text-xs text-slate-500">Plan limiti dolu</span>
        )}
      </div>
    </div>
  );
}
