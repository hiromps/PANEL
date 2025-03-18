"use client";

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, ShoppingCart, Package, Crown } from 'lucide-react';

export default function NewOrder() {
  return (
    <div className="container mx-auto p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#1A1F2E] dark:to-[#141824] min-h-screen rounded-t-2xl shadow-sm">
      {/* Service Type Buttons */}
      <div className="flex space-x-4 mb-8">
        <Button
          variant="ghost"
          className="flex-1 flex items-center justify-center space-x-3 py-6 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 shadow-sm"
        >
          <ShoppingCart className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-gray-900 dark:text-white">新規注文</span>
        </Button>
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
      <Card className="p-6 bg-white/70 dark:bg-[#1E2538]/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 shadow-xl">
        <div className="space-y-6">
          <div>
            <Input
              type="search"
              placeholder="Search"
              className="w-full bg-white dark:bg-[#2C3740] border border-gray-200 dark:border-gray-700"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Category</h3>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram-likes">Instagram likes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Service</h3>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="likes-mix">1938 - Instagram Likes mix 🔥 ⭕ - $0.021 per 1000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Link</h3>
            <Input
              type="url"
              placeholder="Enter link"
              className="w-full bg-white dark:bg-[#2C3740] border border-gray-200 dark:border-gray-700"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Quantity</h3>
            <Input
              type="number"
              placeholder="Min: 10 - Max: 20 000"
              className="w-full bg-white dark:bg-[#2C3740] border border-gray-200 dark:border-gray-700"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Average time</h3>
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-[#2C3740] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <Clock className="w-5 h-5 text-gray-500" />
              <span>6 hours 42 minutes</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Charge</h3>
            <div className="bg-gray-50 dark:bg-[#2C3740] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              $0.00
            </div>
          </div>

          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            Submit
          </Button>
        </div>
      </Card>
    </div>
  );
}