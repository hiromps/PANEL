"use client";

import { Settings, Wallet, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="fixed top-0 right-0 left-64 z-10 bg-white dark:bg-[#1C2731] p-4 flex items-center justify-between border-b dark:border-[#2C3740]"
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <span className="text-gray-800 dark:text-white font-medium">設定</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <ThemeToggle />
        
        {/* 残高 */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-[#2C3740] px-4 py-2 rounded-lg">
          <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">残高</span>
            <span className="text-gray-800 dark:text-white font-medium">¥10,000</span>
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