import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '言語学習プラットフォーム',
  description: 'Duolingo風の言語学習プラットフォーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <Sidebar />
            <main className="flex-1 overflow-y-auto pt-16">
              <Header />
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}