'use client';

import type { BootstrapInput, FeatureCode } from '@/lib/schema';

const FEATURE_LABELS: Record<FeatureCode, string> = {
  LEAVE_MANAGEMENT: 'İzin Yönetimi',
  SHIFT_MANAGEMENT: 'Vardiya Yönetimi',
  HOLIDAY_MANAGEMENT: 'Tatil Yönetimi',
  ATTENDANCE_HISTORY: 'Devam Kontrol Geçmişi',
  GPS_TRACKING: 'GPS / Konum Doğrulama',
  NOTIFICATION_MANAGEMENT: 'Bildirim Yönetimi',
  ADVANCE_MANAGEMENT: 'Avans Yönetimi',
  EXPENSE_MANAGEMENT: 'Masraf Yönetimi',
  PAYROLL_INFO: 'Bordro Bilgisi',
  SALARY_MANAGEMENT: 'Maaş Tanımlama',
  ICRA_MANAGEMENT: 'İcra Yönetimi',
  ACCRUAL_MANAGEMENT: 'Hakediş Hesaplama',
  PAYMENT_MANAGEMENT: 'Ödeme İşlemleri',
  LEDGER_MANAGEMENT: 'Cari Hesap Defteri',
  REPORTS: 'Raporlar',
  AUDIT_LOGS: 'Denetim Logları',
};

interface Props {
  value: BootstrapInput;
}

export function ReviewStep({ value }: Props) {
  const enabledLeaveTypes =
    value.leaveTypes.length > 0
      ? value.leaveTypes
      : [
          { code: 'YILLIK', name: 'Yillik Izin (varsayılan)', defaultQuota: 14, isPaid: true },
          { code: 'MAZERET', name: 'Mazeret Izni (varsayılan)', defaultQuota: 5, isPaid: true },
          { code: 'HASTALIK', name: 'Hastalik Izni (varsayılan)', defaultQuota: 10, isPaid: true },
        ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Özet ve Onay</h2>
        <p className="text-sm text-slate-500">
          Bilgileri kontrol edin. Onayladığınızda backend'e tek atomik işlemde gönderilir.
        </p>
      </div>

      <Section title="Organizasyon">
        <Row k="Şirket Adı" v={value.organization.name} />
        <Row k="Şirket Kodu" v={value.organization.companyCode} />
        <Row k="Plan" v={value.organization.planCode} />
        <Row k="Plan Süresi" v={`${value.organization.planDurationDays} gün`} />
        <Row k="İletişim E-posta" v={value.organization.contactEmail} />
        {value.organization.contactPhone && (
          <Row k="İletişim Telefon" v={value.organization.contactPhone} />
        )}
        {value.organization.addressCity && <Row k="Şehir" v={value.organization.addressCity} />}
        <Row k="Saat Dilimi" v={value.organization.settings?.timezone || 'Europe/Istanbul'} />
      </Section>

      <Section title="Direktör">
        <Row k="Ad Soyad" v={`${value.admin.firstName} ${value.admin.lastName}`} />
        <Row k="E-posta" v={value.admin.email} />
        <Row k="Telefon" v={value.admin.phone} />
        <Row k="Şifre" v={'•'.repeat(value.admin.password.length || 6)} />
        <Row
          k="Devam Muafiyeti"
          v={value.admin.isAttendanceExempt ? 'Evet' : 'Hayır'}
        />
      </Section>

      <Section title={`Departmanlar (${value.departments.length})`}>
        {value.departments.length === 0 ? (
          <p className="text-sm text-slate-500">Eklenmedi.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {value.departments.map((d, i) => {
              const days = Object.keys(d.workSchedule).sort().join(', ');
              return (
                <li key={i}>
                  <span className="font-medium">{d.name}</span> — Çalışma günleri: {days || '—'},{' '}
                  Lokasyon: {(d.locations || []).length}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section
        title={`İzin Türleri (${
          value.leaveTypes.length > 0 ? value.leaveTypes.length : 'varsayılan 3'
        })`}
      >
        <ul className="text-sm space-y-1">
          {enabledLeaveTypes.map((lt, i) => (
            <li key={i}>
              <span className="font-mono text-xs">{lt.code}</span> — {lt.name} (
              {lt.defaultQuota} gün, {lt.isPaid ? 'ücretli' : 'ücretsiz'})
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Tatiller">
        <p className="text-sm">
          {value.holidays.seedDefaults
            ? '✓ Türkiye ulusal tatilleri otomatik yüklenecek'
            : '✗ Varsayılan tatiller yüklenmeyecek'}
        </p>
        {value.holidays.custom.length > 0 && (
          <ul className="text-sm mt-2 space-y-1">
            {value.holidays.custom.map((h, i) => (
              <li key={i}>
                {h.date} — {h.name} {h.isRecurring && '(yıllık tekrar)'}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Vardiyalar (${value.shifts.length})`}>
        {value.shifts.length === 0 ? (
          <p className="text-sm text-slate-500">Eklenmedi (departman saatleri kullanılır).</p>
        ) : (
          <ul className="text-sm space-y-1">
            {value.shifts.map((s, i) => (
              <li key={i}>
                <span className="font-mono text-xs">{s.code}</span> — {s.name} (
                {s.startTime}–{s.endTime}, {s.scope})
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title={`Özellik Bayrakları (${
          Object.values(value.features ?? {}).filter(Boolean).length
        }/${Object.keys(value.features ?? {}).length} aktif)`}
      >
        <ul className="text-sm grid grid-cols-1 md:grid-cols-2 gap-1">
          {Object.entries(value.features ?? {}).map(([k, v]) => {
            const label = FEATURE_LABELS[k as FeatureCode] ?? k;
            return (
              <li
                key={k}
                className={v ? 'text-emerald-700' : 'text-slate-400 line-through'}
              >
                {v ? '✓' : '✗'} {label}{' '}
                <span className="text-[10px] text-slate-400 font-mono">({k})</span>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-2 text-sm font-semibold bg-slate-50">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b border-slate-100 last:border-b-0">
      <span className="text-slate-500">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
