"use client";

import { Settings, Wallet, Star, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';
import { Dispatch, SetStateAction, useState } from 'react';
import { cn } from '@/lib/utils';
import { useBalanceStore } from '@/lib/store';
import { AddFundsDialog } from './add-funds-dialog';

interface HeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function Header({ isCollapsed, setIsCollapsed }: HeaderProps) {
  const balance = useBalanceStore((state) => state.balance);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="w-full bg-white dark:bg-[#1C2731] p-2 flex flex-col border-b dark:border-[#2C3740] transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2C3740] transition-colors hidden md:block"
            aria-label={isCollapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2C3740] transition-colors md:hidden"
            aria-label="メニューを開く"
          >
            <Menu className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <div className="font-bold">
            <span className="text-[#0066FF] text-lg sm:text-xl">SGW</span>
          </div>
          <div className="hidden md:flex items-center space-x-1 ml-3">
            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-800 dark:text-white font-medium text-sm">設定</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-3">
          <ThemeToggle />
          
          {/* 資金追加ボタン */}
          <AddFundsDialog />
          
          {/* 残高 - モバイルでは省略表示 */}
          <div className="hidden sm:flex items-center space-x-1 bg-gray-100 dark:bg-[#2C3740] px-3 py-1 rounded-lg">
            <Wallet className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">残高</span>
              <span className="text-gray-800 dark:text-white font-medium text-sm">¥{balance.toLocaleString()}</span>
            </div>
          </div>

          {/* モバイル用の残高表示 */}
          <div className="sm:hidden flex items-center space-x-1 bg-gray-100 dark:bg-[#2C3740] px-1 py-1 rounded-lg">
            <Wallet className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-800 dark:text-white font-medium text-xs">¥{balance.toLocaleString()}</span>
          </div>

          {/* 連続ログイン実績 - モバイルでは非表示 */}
          <div className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-[#2C3740] px-3 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">連続</span>
              <span className="text-gray-800 dark:text-white font-medium text-sm">15日</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* モバイルメニュー */}
      {mobileMenuOpen && (
        <div className="mt-1 md:hidden py-1 px-2 bg-gray-50 dark:bg-[#2C3740] rounded-lg">
          <div className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-[#3C4750] rounded-md transition-colors">
            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-800 dark:text-white font-medium text-sm">設定</span>
          </div>
          <div className="flex items-center space-x-2 p-1 mt-1 hover:bg-gray-100 dark:hover:bg-[#3C4750] rounded-md transition-colors">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-800 dark:text-white font-medium text-sm">連続ログイン: 15日</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}