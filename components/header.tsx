"use client";

import { Star, Menu, Gift, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import Link from 'next/link';
import { useLoginStreakStore } from '@/lib/store';
import { toast } from 'sonner';

interface HeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function Header({ isCollapsed, setIsCollapsed }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 連続ログイン情報を取得
  const { streak, checkLoginStreak } = useLoginStreakStore();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // ページ読み込み時に連続ログインをチェック
  useEffect(() => {
    const prevStreak = streak;
    checkLoginStreak();
    
    // 7日ごとのボーナス獲得通知
    setTimeout(() => {
      const currentStreak = useLoginStreakStore.getState().streak;
      if (currentStreak > prevStreak && currentStreak % 7 === 0) {
        toast.success('🎉 7日間連続ログインボーナス獲得！ 残高に100円追加されました', {
          duration: 5000,
        });
      }
    }, 1000);
  }, []);

  // 次の7日ボーナスまでの残り日数を計算
  const daysUntilNextBonus = 7 - (streak % 7);
  const showBonusIndicator = daysUntilNextBonus === 1; // あと1日でボーナス獲得

  // タップでカウントを増やす関数
  const incrementStreak = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const streakStore = useLoginStreakStore.getState();
    const today = new Date().toISOString().split('T')[0];
    
    // すでに今日ログインしている場合は増やさない
    if (streakStore.lastLoginDate === today) {
      toast.info('今日はすでにログイン済みです。明日また来てください！', {
        duration: 3000,
      });
      setIsAnimating(false);
      return;
    }
    
    // カウント増加
    checkLoginStreak();
    
    // アニメーション終了
    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="w-full bg-white dark:bg-[#1C2731] p-2 flex flex-col border-b dark:border-[#2C3740] transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* トグルボタン - 常に表示 */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2C3740] transition-colors"
            aria-label={isCollapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
          >
            <Menu className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>

          <Link href="/" className="font-bold hover:opacity-80 transition-opacity">
            <span className="text-[#0066FF] text-lg sm:text-xl">SGW</span>
          </Link>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          {/* 連続ログイン実績 - タップで増加 */}
          <div 
            className="relative flex items-center space-x-1 bg-gray-100 dark:bg-[#2C3740] px-3 py-1.5 rounded-lg cursor-pointer active:scale-95 transition-transform hover:bg-gray-200 dark:hover:bg-[#3C4750]" 
            onClick={incrementStreak}
          >
            <div className="relative group">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={isAnimating ? { scale: [1, 1.5, 1], rotate: [0, 360] } : {}}
                  transition={{ duration: 1.5 }}
                  className="relative"
                >
                  <Star className="w-5 h-5 text-yellow-400 drop-shadow-md" fill="#FBBF24" />
                  {isAnimating && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Star className="w-5 h-5 text-yellow-400" fill="#FBBF24" />
                    </motion.div>
                  )}
                </motion.div>
                <div className="flex items-center">
                  <span className="text-gray-800 dark:text-white font-medium text-sm">連続 {streak}日</span>
                  {/* タップを促すアイコン */}
                  <Plus className="ml-1 w-3 h-3 text-gray-400 dark:text-gray-500" />
                </div>
                
                {/* ボーナス獲得まで1日の場合のインジケーター */}
                {showBonusIndicator && (
                  <div className="absolute -top-1 -right-1 animate-pulse">
                    <Gift className="w-4 h-4 text-red-500" />
                  </div>
                )}
              </div>
              
              {/* ツールチップ - 下側に表示 */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-white dark:bg-[#2C3740] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-xs z-50 border border-gray-200 dark:border-[#3C4750]">
                <div className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-[#2C3740] border-l border-t border-gray-200 dark:border-[#3C4750]"></div>
                <p className="mb-1">毎日タップして連続記録を更新！</p>
                <p className="mb-1">次の報酬まで: あと{daysUntilNextBonus}日</p>
                <p className="font-medium">7日連続で100円ボーナス!</p>
              </div>
            </div>
          </div>
          
          <ThemeToggle />
        </div>
      </div>
    </motion.div>
  );
}