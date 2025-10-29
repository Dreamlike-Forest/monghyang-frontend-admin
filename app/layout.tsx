import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '몽향양조장 관리자',
  description: '몽향양조장 관리자 페이지',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}