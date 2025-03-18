"use client";

import { ShoppingBag, Package, Wrench, ClipboardList, HelpCircle, Wallet, Terminal, MessageSquare, ScrollText, Users, Bell, Crown, X, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AddFundsDialog } from './add-funds-dialog';
import { useBalanceStore } from '@/lib/store';

const menuItems = [
  { icon: ShoppingBag, label: '新規注文', href: '/new-order' },
  { icon: Package, label: '大量注文', href: '/bulk-order' },
  { icon: Wrench, label: 'サービス', href: '/services' },
  { icon: ClipboardList, label: '注文履歴', href: '/orders' },
  { icon: HelpCircle, label: 'よくある質問', href: '/faq' },
  { icon: Terminal, label: 'API', href: '/api' },
  { icon: MessageSquare, label: '問い合わせ', href: '/contact' },
  { icon: ScrollText, label: '利用規約', href: '/terms' },
  { icon: Users, label: 'アフィリエイト', href: '/affiliate' },
  { icon: Bell, label: '更新情報', href: '/updates' },
  { icon: Crown, label: 'VIPステータス', href: '/vip' },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const balance = useBalanceStore((state) => state.balance);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  if (isCollapsed) {
    return null; // サイドバーが閉じているときは何も表示しない
  }

  return (
    <motion.div
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -250, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`w-64 bg-gray-50 dark:bg-[#1C2731] p-4 flex flex-col border-r dark:border-[#2C3740] h-full overflow-hidden ${isMobile ? 'pt-8' : 'pt-10'}`}
    >
      {isMobile && (
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#2C3740] transition-colors z-50"
          aria-label="閉じる"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      )}
      
      <div>
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4">アカウント</h2>
      </div>
      
      <nav className="space-y-1 flex-1 overflow-y-auto mt-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* 残高表示 */}
        <div className="px-4 mb-2">
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-[#2C3740] px-3 py-2 rounded-lg">
            <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">残高</span>
              <span className="text-gray-800 dark:text-white font-medium">¥{balance.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* 資金追加ボタン */}
        <div className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C3740] transition-colors mb-4">
          <AddFundsDialog />
        </div>
        
        {menuItems.map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C3740] transition-colors group",
              index > 5 ? 'text-sm' : ''
            )}
            onClick={() => isMobile && setIsCollapsed(true)}
          >
            <item.icon className={cn(
              "flex-shrink-0",
              index > 5 ? 'w-5 h-5' : 'w-5 h-5',
              "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
            )} />
            <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {item.label}
            </span>
          </Link>
        ))}
        
        {/* 区切り線 */}
        <div className="px-4 py-2">
          <div className="border-t border-gray-200 dark:border-[#2C3740]"></div>
        </div>
        
        {/* 設定リンク（一番下） */}
        <Link
          href="/settings"
          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C3740] transition-colors group"
        >
          <Settings className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">設定</span>
        </Link>
      </nav>
    </motion.div>
  );
}