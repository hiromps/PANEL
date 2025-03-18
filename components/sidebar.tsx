"use client";

import { ShoppingBag, Package, Wrench, ClipboardList, HelpCircle, Wallet, Terminal, MessageSquare, ScrollText, Users, Bell, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: ShoppingBag, label: '新規注文', href: '/new-order' },
  { icon: Package, label: '大量注文', href: '/bulk-order' },
  { icon: Wrench, label: 'サービス', href: '/services' },
  { icon: ClipboardList, label: '注文履歴', href: '/orders' },
  { icon: HelpCircle, label: 'よくある質問', href: '/faq' },
  { icon: Wallet, label: '資金を追加', href: '/add-funds' },
  { icon: Terminal, label: 'API', href: '/api' },
  { icon: MessageSquare, label: '問い合わせ', href: '/contact' },
  { icon: ScrollText, label: '利用規約', href: '/terms' },
  { icon: Users, label: 'アフィリエイト', href: '/affiliate' },
  { icon: Bell, label: '更新情報', href: '/updates' },
  { icon: Crown, label: 'VIPステータス', href: '/vip' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className={cn(
        "relative h-full bg-gray-50 dark:bg-[#1C2731] p-4 flex flex-col border-r dark:border-[#2C3740] transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between mb-8">
        <div className={cn(
          "font-bold transition-all duration-300 overflow-hidden",
          isCollapsed ? "w-0" : "w-full"
        )}>
          <span className="text-[#0066FF] text-2xl">SGW</span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2C3740] transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {menuItems.map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C3740] transition-colors group",
              index > 6 ? 'text-sm' : ''
            )}
          >
            <item.icon className={cn(
              "flex-shrink-0",
              index > 6 ? 'w-5 h-5' : 'w-5 h-5',
              "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
            )} />
            <span className={cn(
              "text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}