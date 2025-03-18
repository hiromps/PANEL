'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBalanceStore } from '@/lib/store';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ timestamp: string, provider: string } | null>(null);
  
  // 処理状態を追跡するRef
  const isProcessingRef = useRef(false);
  // セッションの処理済みフラグを保持するRef
  const sessionProcessedRef = useRef(false);
  
  // Zustandのストアから関数を取得
  const addFunds = useBalanceStore((state) => state.addFunds);

  // 支払い情報を安全に取得
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const provider = searchParams.get('provider') || 'stripe';
  
  // PayPal固有のパラメータ
  const token = searchParams.get('token'); // PayPalが返すトークン
  const payerId = searchParams.get('PayerID'); // PayPalが返す支払者ID
  
  // トランザクションIDの生成
  const getTransactionId = () => {
    if (provider === 'paypal') {
      if (orderId) {
        return `paypal-${orderId}`;
      } else if (token) {
        return `paypal-${token}`;
      }
    } else if (sessionId) {
      return `stripe-${sessionId}`;
    }
    return null;
  };
  
  const transactionId = getTransactionId();

  useEffect(() => {
    // すでに処理中あるいは完了している場合は何もしない
    if (isProcessingRef.current || verified || sessionProcessedRef.current) {
      return;
    }
    
    // 処理フラグを立てる
    isProcessingRef.current = true;
    
    // 取引IDがなければ処理しない
    if (!transactionId) {
      setError('支払い情報が見つかりません');
      setIsLoading(false);
      isProcessingRef.current = false;
      return;
    }
    
    // ローカルストレージから処理済みセッションを取得する関数
    const getProcessedSessions = () => {
      try {
        return JSON.parse(localStorage.getItem('processed_sessions') || '[]');
      } catch (e) {
        return [];
      }
    };

    // セッションを処理済みとしてマークする関数
    const markSessionAsProcessed = (id: string) => {
      try {
        const processedSessions = getProcessedSessions();
        if (!processedSessions.includes(id)) {
          const updatedSessions = [...processedSessions, id];
          localStorage.setItem('processed_sessions', JSON.stringify(updatedSessions));
          sessionProcessedRef.current = true;
        }
      } catch (e) {
        // エラーは無視して処理を継続
      }
    };

    // ローカルストレージで既に処理済みかチェック
    const processedSessions = getProcessedSessions();
    const isAlreadyProcessed = processedSessions.includes(transactionId);

    if (isAlreadyProcessed) {
      // 既に処理済みの場合は金額表示のみ（残高更新はスキップ）
      const fetchPaymentInfo = async () => {
        try {
          const response = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              sessionId, 
              orderId, 
              provider 
            }),
          });

          const data = await response.json();
          if (data.success) {
            setAmount(data.amount);
            
            // 現在の日時情報を設定
            setPaymentInfo({ 
              timestamp: new Date().toLocaleString('ja-JP'),
              provider: data.provider
            });
            
            setVerified(true);
          } else {
            setError('支払いが完了していません');
          }
        } catch (error) {
          setError('支払い検証中にエラーが発生しました');
        } finally {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      };

      fetchPaymentInfo();
      return;
    }

    // 新規の支払いを検証
    const verifyPayment = async () => {
      try {
        console.log('支払い検証開始:', { sessionId, orderId, token, provider, payerId });
        
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            sessionId, 
            orderId,
            token, // PayPalトークンを追加
            payerId, // 支払者IDを追加
            provider 
          }),
        });

        const data = await response.json();

        if (data.success) {
          // 金額を設定
          const paymentAmount = data.amount;
          setAmount(paymentAmount);
          
          // 処理済みとしてマーク（先に処理済みマークをつけることで二重処理を防止）
          markSessionAsProcessed(transactionId);
          
          // セッションIDを添えて残高を更新
          addFunds(paymentAmount, transactionId);
          
          // 現在の日時情報を設定
          setPaymentInfo({ 
            timestamp: new Date().toLocaleString('ja-JP'),
            provider: data.provider
          });
          
          setVerified(true);
        } else {
          setError('支払いが完了していません');
        }
      } catch (error) {
        setError('支払い検証中にエラーが発生しました');
      } finally {
        setIsLoading(false);
        isProcessingRef.current = false;
      }
    };

    verifyPayment();
  }, [sessionId, orderId, provider, addFunds, transactionId]);

  // ホームに戻る処理
  const handleBackToHome = () => {
    router.push('/');
  };

  // 決済サービスの名前を取得
  const getProviderName = () => {
    if (!paymentInfo) return '';
    return paymentInfo.provider === 'paypal' ? 'PayPal' : 'Stripe';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 min-h-screen mt-24">
        <Card className="p-6">
          <div className="text-center">処理中...</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 min-h-screen mt-24">
        <Card className="p-6">
          <div className="text-center text-red-500">{error}</div>
          <div className="mt-4 text-center">
            <Button onClick={handleBackToHome}>ホームに戻る</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 min-h-screen mt-24">
      <Card className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">支払いが完了しました</h1>
          {amount && (
            <p className="mb-4">
              {amount.toLocaleString()}円が追加されました
            </p>
          )}
          {paymentInfo && (
            <div className="text-sm text-gray-500 mb-4">
              <p>決済サービス: {getProviderName()}</p>
              <p>処理日時: {paymentInfo.timestamp}</p>
            </div>
          )}
          <Button onClick={handleBackToHome}>ホームに戻る</Button>
        </div>
      </Card>
    </div>
  );
} 