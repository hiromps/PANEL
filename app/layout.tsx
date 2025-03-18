"use client";

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

// メタデータはサーバーコンポーネントでのみ使用できるため、ここでは定義できません
// export const metadata: Metadata = {
//   title: '言語学習プラットフォーム',
//   description: 'Duolingo風の言語学習プラットフォーム',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 画面サイズを監視して、モバイルサイズかどうかを判定
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // モバイルの場合は自動的にサイドバーを閉じる
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    // 初期チェック
    checkIfMobile();

    // リサイズ時にチェック
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          storageKey="duolingo-theme"
        >
          <div className="relative flex h-screen overflow-hidden bg-background">
            <div className="fixed top-0 left-0 h-full z-20">
              <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            </div>
            <div className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${!isCollapsed && !isMobile ? 'ml-64' : 'ml-0'}`}>
              <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            </div>
            <main className={`flex-1 w-full overflow-y-auto transition-all duration-300 bg-gray-50 dark:bg-[#1C2731] ${!isCollapsed && !isMobile ? 'ml-64' : 'ml-0'}`}>
              <div className={`${isMobile ? 'pt-10' : 'pt-12'}`}>
                {children}
              </div>
            </main>
          </div>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}