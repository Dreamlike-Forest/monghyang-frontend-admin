import { AuthProvider } from '../utils/authUtils';  // 경로 수정
import './globals.css';

export const metadata = {
  title: '몽향의숲 - 관리 시스템',
  description: '양조장 체험 및 전통주 통합 관리 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}