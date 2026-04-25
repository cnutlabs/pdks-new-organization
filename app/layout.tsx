import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PDKS — Yeni Organizasyon Kurulumu',
  description: 'PDKS sistemine yeni organizasyon ekleme aracı',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
