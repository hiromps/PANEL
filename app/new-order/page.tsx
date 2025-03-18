"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Package, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useBalanceStore } from '@/lib/store';
import { toast } from 'sonner';

export default function NewOrder() {
  const [quantity, setQuantity] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [service, setService] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { balance, deductFunds } = useBalanceStore();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // URLのハッシュ値を監視してサイドバーの状態を検知
  useEffect(() => {
    const checkSidebarState = () => {
      // レイアウトコンポーネントと状態を共有するため、localStorageを使用
      const sidebarState = localStorage.getItem('sidebarOpen');
      setSidebarOpen(sidebarState === 'true');
    };

    window.addEventListener('storage', checkSidebarState);
    checkSidebarState(); // 初期チェック
    
    return () => {
      window.removeEventListener('storage', checkSidebarState);
    };
  }, []);

  // サービスが選択されたときに価格を計算
  const handleServiceChange = (value: string) => {
    setService(value);
    if (value === 'likes-mix') {
      // 1000件あたり $0.021
      const rate = 0.021;
      const calculatedPrice = parseInt(quantity || '0') * rate / 1000;
      setPrice(calculatedPrice);
    }
  };

  // 数量が変更されたときに価格を更新
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = e.target.value;
    setQuantity(newQuantity);
    
    if (service === 'likes-mix') {
      // 1000件あたり $0.021
      const rate = 0.021;
      const calculatedPrice = parseInt(newQuantity || '0') * rate / 1000;
      setPrice(calculatedPrice);
    }
  };

  // 注文処理
  const handleOrder = () => {
    if (!category || !service || !link || !quantity) {
      toast.error('すべての項目を入力してください');
      return;
    }

    setIsLoading(true);

    // 残高から金額を差し引く
    const success = deductFunds(price);

    if (success) {
      // 注文処理が成功したことを通知
      toast.success('注文が完了しました');
      
      // フォームをリセット
      setCategory('');
      setService('');
      setLink('');
      setQuantity('');
      setPrice(0);
    } else {
      toast.error('残高が不足しています');
    }

    setIsLoading(false);
  };

  return (
    <div className={`container mx-auto px-3 sm:px-6 lg:px-8 min-h-screen mt-12 sm:mt-16 pb-6`}>
      <div className={`transition-all duration-300 ${isSmallScreen && sidebarOpen ? 'opacity-30 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
        {/* Service Type Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 pt-1">
          <div className="h-full">
            <Link href="/new-order" className="h-full w-full block">
              <Button
                variant="ghost"
                className="w-full h-full flex items-center justify-center space-x-3 py-3 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 shadow-sm"
              >
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">新規注文</span>
              </Button>
            </Link>
          </div>
          <div className="h-full">
            <Button
              variant="ghost"
              className="w-full h-full flex items-center justify-center space-x-3 py-3 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 shadow-sm"
            >
              <Package className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">大量注文</span>
            </Button>
          </div>
          <div className="h-full">
            <Button
              variant="ghost"
              className="w-full h-full flex items-center justify-center space-x-3 py-3 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 shadow-sm"
            >
              <Crown className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">VIPステータス</span>
            </Button>
          </div>
        </div>

        {/* Search and Order Form */}
        <Card className="p-3 sm:p-5 bg-white/70 dark:bg-[#1E2538]/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-lg">
          <div className="space-y-3 sm:space-y-5">
            <div>
              <Input
                type="search"
                placeholder="検索"
                className="w-full bg-white dark:bg-[#2C3740] border border-gray-200 dark:border-gray-700"
              />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium mb-1">カテゴリー</h3>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram-likes">Instagram いいね</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium mb-1">サービス</h3>
              <Select value={service} onValueChange={handleServiceChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="サービスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="likes-mix">1938 - Instagram いいね ミックス 🔥 ⭕ - 1000件あたり $0.021</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium mb-1">リンク</h3>
              <Input
                type="url"
                placeholder="リンクを入力"
                className="w-full bg-white dark:bg-[#2C3740] border border-gray-200 dark:border-gray-700"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium mb-1">数量</h3>
              <Input
                type="number"
                placeholder="最小: 10 - 最大: 20,000"
                className="w-full bg-white dark:bg-[#2C3740] border border-gray-200 dark:border-gray-700"
                min="10"
                max="20000"
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium mb-1">料金</h3>
              <div className="bg-gray-50 dark:bg-[#2C3740] p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                ${price.toFixed(2)}
              </div>
            </div>

            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-base"
              onClick={handleOrder}
              disabled={isLoading || !category || !service || !link || !quantity || parseInt(quantity) < 10 || price === 0}
            >
              {isLoading ? '処理中...' : '注文する'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}