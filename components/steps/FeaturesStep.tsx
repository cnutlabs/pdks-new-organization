'use client';

import { FEATURE_CODES, type FeatureCode } from '@/lib/schema';

interface Props {
  value: Partial<Record<FeatureCode, boolean>> | undefined;
  onChange: (next: Partial<Record<FeatureCode, boolean>>) => void;
}

interface FeatureMeta {
  label: string;
  description: string;
}

const FEATURE_META: Record<FeatureCode, FeatureMeta> = {
  // Operational
  LEAVE_MANAGEMENT: {
    label: 'İzin Yönetimi',
    description: 'İzin türleri, talep, onay/red, bakiye',
  },
  SHIFT_MANAGEMENT: {
    label: 'Vardiya Yönetimi',
    description: 'Vardiya tanımları, atamalar, gece vardiyası',
  },
  HOLIDAY_MANAGEMENT: {
    label: 'Tatil Yönetimi',
    description:
      'Tatil ekleme/düzenleme/silme. Kapalıyken sistem tatilleri okuyabilir ama yönetilemez.',
  },
  ATTENDANCE_HISTORY: {
    label: 'Devam Kontrol Geçmişi',
    description: 'Mobil uygulamada geçmiş kayıtlarını görüntüleme',
  },
  GPS_TRACKING: {
    label: 'GPS / Konum Doğrulama',
    description:
      'Check-in/out sırasında geofence kontrolü. Kapalıyken konum kontrolü yapılmaz.',
  },
  // Communication
  NOTIFICATION_MANAGEMENT: {
    label: 'Bildirim Yönetimi',
    description: 'Push bildirimleri, gruplar, zamanlanmış (recurring)',
  },
  // Requests
  ADVANCE_MANAGEMENT: {
    label: 'Avans Yönetimi',
    description: 'Çalışan avans talepleri ve onayları',
  },
  EXPENSE_MANAGEMENT: {
    label: 'Masraf Yönetimi',
    description: 'Masraf türleri, talepleri, fiş yönetimi',
  },
  PAYROLL_INFO: {
    label: 'Bordro Bilgisi',
    description: 'Çalışanın kendi maaş/bordro bilgisini görmesi',
  },
  // Finance
  SALARY_MANAGEMENT: {
    label: 'Maaş Tanımlama',
    description: 'Yönetici tarafında maaş kayıtları (BRUT/NET, geçmiş)',
  },
  ICRA_MANAGEMENT: {
    label: 'İcra Yönetimi',
    description: 'İcra kesintileri, dönem takibi, otomatik avans',
  },
  ACCRUAL_MANAGEMENT: {
    label: 'Hakediş Hesaplama',
    description: 'Aylık toplu hakediş işlemi ve geçmişi',
  },
  PAYMENT_MANAGEMENT: {
    label: 'Ödeme İşlemleri',
    description: 'Nakit/banka ödemeleri, hızlı avans/masraf girişi',
  },
  LEDGER_MANAGEMENT: {
    label: 'Cari Hesap Defteri',
    description: 'Personel cari geçmişi, bakiyeler, storno',
  },
  // Reporting
  REPORTS: {
    label: 'Raporlar',
    description: 'Dashboard, devam, izin, mesai raporları (Excel export)',
  },
  AUDIT_LOGS: {
    label: 'Denetim Logları',
    description: 'Tüm sistem hareketlerinin kayıtları',
  },
};

interface CategoryDef {
  title: string;
  codes: FeatureCode[];
}

const CATEGORIES: CategoryDef[] = [
  {
    title: 'Operasyon',
    codes: [
      'LEAVE_MANAGEMENT',
      'SHIFT_MANAGEMENT',
      'HOLIDAY_MANAGEMENT',
      'ATTENDANCE_HISTORY',
      'GPS_TRACKING',
    ],
  },
  {
    title: 'İletişim',
    codes: ['NOTIFICATION_MANAGEMENT'],
  },
  {
    title: 'Talepler (Çalışan Tarafı)',
    codes: ['ADVANCE_MANAGEMENT', 'EXPENSE_MANAGEMENT', 'PAYROLL_INFO'],
  },
  {
    title: 'Finans (Yönetici Tarafı)',
    codes: [
      'SALARY_MANAGEMENT',
      'ICRA_MANAGEMENT',
      'ACCRUAL_MANAGEMENT',
      'PAYMENT_MANAGEMENT',
      'LEDGER_MANAGEMENT',
    ],
  },
  {
    title: 'Raporlama',
    codes: ['REPORTS', 'AUDIT_LOGS'],
  },
];

export function FeaturesStep({ value, onChange }: Props) {
  const map = value ?? {};

  const toggle = (code: FeatureCode) => {
    onChange({ ...map, [code]: !(map[code] ?? true) });
  };

  const setAll = (val: boolean) => {
    const next: Partial<Record<FeatureCode, boolean>> = {};
    for (const code of FEATURE_CODES) next[code] = val;
    onChange(next);
  };

  const setCategory = (codes: FeatureCode[], val: boolean) => {
    const next = { ...map };
    for (const c of codes) next[c] = val;
    onChange(next);
  };

  const enabledCount = FEATURE_CODES.filter((c) => map[c] ?? true).length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Özellik Bayrakları</h2>
          <p className="text-sm text-slate-500">
            Organizasyon için açılacak modüller. {enabledCount}/{FEATURE_CODES.length} aktif.
            Sonradan organizasyon panelinden değiştirilebilir.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setAll(true)} className="btn-secondary text-xs">
            Tümünü Aç
          </button>
          <button type="button" onClick={() => setAll(false)} className="btn-secondary text-xs">
            Tümünü Kapat
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const catEnabled = cat.codes.filter((c) => map[c] ?? true).length;
          const catTotal = cat.codes.length;
          return (
            <div key={cat.title} className="rounded-md border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 bg-slate-50">
                <p className="text-sm font-semibold">
                  {cat.title}{' '}
                  <span className="text-xs text-slate-500 font-normal">
                    ({catEnabled}/{catTotal})
                  </span>
                </p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCategory(cat.codes, true)}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    Aç
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setCategory(cat.codes, false)}
                    className="text-xs text-slate-600 hover:underline"
                  >
                    Kapat
                  </button>
                </div>
              </div>
              <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-1">
                {cat.codes.map((code) => {
                  const meta = FEATURE_META[code];
                  const checked = map[code] ?? true;
                  return (
                    <label
                      key={code}
                      className={[
                        'flex items-start gap-3 rounded-md p-3 cursor-pointer transition',
                        checked ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-slate-50 hover:bg-slate-100',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-1 rounded border-slate-300"
                        checked={checked}
                        onChange={() => toggle(code)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{meta.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{meta.description}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">{code}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
