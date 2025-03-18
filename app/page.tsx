"use client";

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, ShoppingCart, Package, Crown } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto p-8 min-h-screen mt-24">
      {/* Service Type Buttons */}
      <div className="flex space-x-4 mb-8 pt-4">
        <Link href="/new-order" className="flex-1">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center space-x-3 py-6 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 shadow-sm"
          >
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-900 dark:text-white">新規注文</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="flex-1 flex items-center justify-center space-x-3 py-6 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 shadow-sm"
        >
          <Package className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-gray-900 dark:text-white">大量注文</span>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 flex items-center justify-center space-x-3 py-6 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 shadow-sm"
        >
          <Crown className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-gray-900 dark:text-white">VIPステータス</span>
        </Button>
      </div>

      {/* Search and Order Form */}
      <Card className="p-6 bg-white/70 dark:bg-[#1E2538]/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-lg">
        <div className="space-y-6">
          <div>
            <Input
              type="search"
              placeholder="検索"
              className="w-full bg-white dark:bg-[#2C3740] border border-gray-200 dark:border-gray-700"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">カテゴリー</h3>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram-likes">Instagram いいね</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">サービス</h3>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="サービスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="likes-mix">1938 - Instagram いいね ミックス 🔥 ⭕ - 1000件あたり $0.021</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">リンク</h3>
            <Input
              type="url"
              placeholder="リンクを入力"
              className="w-full bg-white dark:bg-[#2C3740] border border-gray-200 dark:border-gray-700"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">数量</h3>
            <Input
              type="number"
              placeholder="最小: 10 - 最大: 20,000"
              className="w-full bg-white dark:bg-[#2C3740] border border-gray-200 dark:border-gray-700"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">料金</h3>
            <div className="bg-gray-50 dark:bg-[#2C3740] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              $0.00
            </div>
          </div>

          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            注文する
          </Button>
        </div>
      </Card>
    </div>
  );
}