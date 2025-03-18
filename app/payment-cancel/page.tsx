'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentCancel() {
  return (
    <div className="container mx-auto p-8 min-h-screen mt-24">
      <Card className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">支払いがキャンセルされました</h1>
          <p className="mb-4">支払い処理が中断されました</p>
          <Link href="/">
            <Button>ホームに戻る</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
} 