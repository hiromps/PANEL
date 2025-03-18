"use client";

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';

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

  // サイドバーの状態を変更する拡張関数
  const toggleSidebar = (value: SetStateAction<boolean>) => {
    // 関数または値を適切に処理
    const newValue = typeof value === 'function' ? value(isCollapsed) : value;
    setIsCollapsed(newValue);
    // ページコンポーネントと状態を共有
    localStorage.setItem('sidebarOpen', (!newValue).toString());
    // カスタムイベントをディスパッチして他のコンポーネントに通知
    window.dispatchEvent(new Event('storage'));
  };

  // 画面サイズを監視して、モバイルサイズかどうかを判定
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
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
            {/* オーバーレイ：モバイルでサイドバーが開いている時だけ表示 */}
            {!isCollapsed && isMobile && (
              <div 
                className="fixed inset-0 bg-black/50 z-10"
                onClick={() => toggleSidebar(true)}
              />
            )}
            
            {/* サイドバー */}
            <div className={`fixed top-0 left-0 h-full z-20 transition-all duration-300 ${isCollapsed && isMobile ? '-translate-x-full' : 'translate-x-0'}`}>
              <Sidebar isCollapsed={isCollapsed} setIsCollapsed={toggleSidebar} />
            </div>
            
            {/* ヘッダー */}
            <div className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${!isCollapsed && !isMobile ? 'ml-64' : 'ml-0'}`}>
              <Header isCollapsed={isCollapsed} setIsCollapsed={toggleSidebar} />
            </div>
            
            {/* メインコンテンツ */}
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