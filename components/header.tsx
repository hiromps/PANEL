"use client";

import { Settings, Wallet, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';
import { Dispatch, SetStateAction } from 'react';
import { cn } from '@/lib/utils';
import { useBalanceStore } from '@/lib/store';
import { AddFundsDialog } from './add-funds-dialog';

interface HeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function Header({ isCollapsed, setIsCollapsed }: HeaderProps) {
  const balance = useBalanceStore((state) => state.balance);

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-[#1C2731] p-4 flex items-center justify-between border-b dark:border-[#2C3740] transition-all duration-300"
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2C3740] transition-colors"
            aria-label={isCollapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          <div className="font-bold">
            <span className="text-[#0066FF] text-2xl">SGW</span>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-800 dark:text-white font-medium">設定</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <ThemeToggle />
        
        {/* 資金追加ボタン */}
        <AddFundsDialog />
        
        {/* 残高 */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-[#2C3740] px-4 py-2 rounded-lg">
          <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">残高</span>
            <span className="text-gray-800 dark:text-white font-medium">¥{balance.toLocaleString()}</span>
          </div>
        </div>

        {/* 連続ログイン実績 */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-[#2C3740] px-4 py-2 rounded-lg">
          <Star className="w-5 h-5 text-yellow-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">連続ログイン</span>
            <span className="text-gray-800 dark:text-white font-medium">15日</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}