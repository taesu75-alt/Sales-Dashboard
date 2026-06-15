import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '영업 파이프라인 대시보드',
  description: '영업 리드 진행현황 관리 시스템',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen">{children}</body>
    </html>
  );
}
