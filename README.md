# PDKS — New Organization Tool

Yeni PDKS organizasyonlarını **tek bir formdan** atomik olarak oluşturmak için Next.js
tabanlı süper-admin aracı.

> Bu araç doğrudan veritabanına bağlanmaz. `pdks-backend` üzerine eklenen
> `POST /api/admin/organizations/bootstrap` endpoint'ini çağırır. DB güvenlik
> kuralları (sadece projects-VPS → DB-VPS) bozulmaz.

---

## Mimari

```
[Lokal makine / iç ağ]
   │
   │  (browser)
   ▼
[pdks-new-organization]  ──►  Next.js API route  ──►  pdks-backend
   (form UI)              (X-Seed-Api-Key header eklenir,        ──►  DB
                           browser key'i göremez)
```

- **Browser → Next.js**: form verisi (key yok)
- **Next.js → Backend**: `X-Seed-Api-Key` header'ı server-side eklenir
- **Backend → DB**: zaten kurulu olan iç ağ bağlantısı

---

## Kurulum

### 1) Backend tarafı (pdks-backend)

`.env` dosyasına ekle:

```bash
# 64 karakterlik random key (sadece sen bilmelisin)
SEED_API_KEY=<openssl rand -hex 32 çıktısı>
```

Anahtar üretmek için:

```bash
openssl rand -hex 32
```

Backend zaten gerekli endpoint'i içeriyor (`POST /api/admin/organizations/bootstrap`).
Eğer `SEED_API_KEY` set edilmezse endpoint **503** döner ve devre dışı kalır — açık
bırakmamak için tercih ettiğimiz davranış.

Backend yeniden başlatılmalı.

### 2) Bu proje (pdks-new-organization)

```bash
cd pdks-new-organization
npm install
cp .env.local.example .env.local
# .env.local içine BACKEND_URL ve SEED_API_KEY (BACKEND ile aynı) gir
npm run dev
```

Tarayıcıda: <http://localhost:3100>

---

## .env.local

```bash
BACKEND_URL=http://localhost:3000     # backend instance
SEED_API_KEY=<backend ile aynı 64-char hex key>
```

Backend production'da ise:

```bash
BACKEND_URL=https://api.your-domain.com
SEED_API_KEY=<backend prod ile aynı key>
```

---

## Form Adımları

1. **Organizasyon** — şirket adı, kodu, plan (Basic/Pro), iletişim, saat dilimi
2. **Direktör** — ad, soyad, e-posta, telefon, şifre
3. **Departmanlar** — ad, çalışma günleri ve saatleri, GPS lokasyonları
4. **İzin Türleri** — kod, ad, kota (varsayılan: YILLIK 14, MAZERET 5, HASTALIK 10)
5. **Tatiller** — TR ulusal tatilleri checkbox + özel tatil ekleme
6. **Vardiyalar** — opsiyonel, SHARED veya DEPARTMENTAL kapsamda
7. **Özellikler** — modül bayrakları (LEAVE_MANAGEMENT, SHIFT_MANAGEMENT, vb.)
8. **Onay** — özet ve gönderim

### "Her şey dinamik"

UI'dan girilen tüm bilgiler payload'a yansır ve backend'de **tek transaction**
içinde uygulanır. Hata olursa hiçbir şey kalıcı olmaz.

---

## Güvenlik Modeli

| Katman | Koruma |
|---|---|
| Network | DB'ye sadece backend VPS'i erişiyor (mimari değişmedi) |
| Auth | `X-Seed-Api-Key` header — min 32 char, timing-safe karşılaştırma |
| Rate limit | IP başına 10 dk'da 10 istek (backend tarafında) |
| Anahtar saklanma | Sadece `.env` (backend) ve `.env.local` (Next.js server). Browser görmez. |
| Atomicity | `prisma.$transaction` — yarıda kalma olmaz |

### Anahtarı sızdırırsanız

1. Backend `.env`'de `SEED_API_KEY` değerini değiştirin
2. Backend'i yeniden başlatın
3. Bu projenin `.env.local`'ünü güncelleyin

Eski anahtar artık kabul edilmez.

---

## Komutlar

```bash
npm run dev        # Geliştirme — http://localhost:3100
npm run build      # Prod build
npm run start      # Build edilmiş sürümü çalıştır
npm run typecheck  # TypeScript kontrolü
```

---

## Üretim Deploy (opsiyonel)

İsterseniz aynı VPS'e deploy edebilirsiniz (backend ile aynı sunucuda):

```bash
npm run build
npm run start
# nginx reverse-proxy ile sadece kendi IP'nize açın
```

Ya da sadece `npm run dev` ile lokalden çalıştırıp ihtiyaç duydukça açın —
seed amaçlı bir araç olduğu için bu yeterli.

---

## API Endpoint Detayı (Backend)

`POST /api/admin/organizations/bootstrap`

- Header: `X-Seed-Api-Key: <key>` (zorunlu)
- Body: `lib/schema.ts` içindeki `bootstrapOrganizationSchema` ile aynı şekil
- Response (201): `{ success: true, data: { organization, admin, counts } }`
- Hatalar: 400 validation, 401 invalid key, 429 rate limit, 503 disabled
