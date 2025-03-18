"use client";

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { useState } from 'react';

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

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          storageKey="duolingo-theme"
        >
          <div className="flex h-screen bg-background">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className="flex-1 w-full overflow-y-auto transition-all duration-300 bg-gray-50 dark:bg-[#1C2731]">
              <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
              {children}
            </main>
          </div>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}