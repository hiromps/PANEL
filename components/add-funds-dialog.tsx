import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

// テストキーでStripeを初期化
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function AddFundsDialog() {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

  // 直接APIエンドポイントを使用
  const API_URL = '/api/create-payment-session';

  const handleAddFunds = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // 金額のバリデーション
      if (!amount || isNaN(parseInt(amount)) || parseInt(amount) < 100) {
        const error = '100円以上の金額を入力してください';
        setErrorMessage(error);
        toast.error(error);
        setIsLoading(false);
        return;
      }
      
      // Stripe決済の場合は公開キーをチェック
      if (paymentMethod === 'stripe' && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        const error = 'Stripe公開キーが設定されていません';
        setErrorMessage(error);
        toast.error(error);
        setIsLoading(false);
        return;
      }
      
      // 入力された金額を整数に変換
      const amountValue = parseInt(amount);

      // リクエストボディの作成
      const requestBody = JSON.stringify({ 
        amount: amountValue,
        paymentMethod: paymentMethod
      });

      try {
        // APIリクエスト送信
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'same-origin',
          body: requestBody,
        });

        // レスポンスの取得
        let data: any;
        let responseText = '';

        try {
          // まず、テキストとして応答を取得
          responseText = await response.text();
          
          // JSONとして解析を試みる
          if (responseText.trim()) {
            try {
              data = JSON.parse(responseText);
            } catch (error: any) {
              throw new Error(`JSONパースエラー: ${error.message}`);
            }
          } else {
            throw new Error('空のレスポンスを受信しました');
          }
        } catch (parseError) {
          // JSONパースエラー処理
          if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html>')) {
            const errorMsg = `サーバーからHTMLレスポンスを受信しました。APIエンドポイントが有効かご確認ください`;
            setErrorMessage(errorMsg);
            toast.error('APIエラー: HTMLレスポンスを受信');
          } else {
            const errorMsg = `APIレスポンスのパースに失敗しました`;
            setErrorMessage(`${errorMsg}\n\n受信データ: ${responseText.substring(0, 100)}...`);
            toast.error(errorMsg);
          }
          setIsLoading(false);
          return;
        }

        // エラーレスポンスのハンドリング
        if (!response.ok) {
          const errorMsg = `APIエラー (${response.status}): ${data?.error || '不明なエラー'}`;
          if (data?.message) {
            setErrorMessage(`${errorMsg}\n詳細: ${data.message}`);
          } else {
            setErrorMessage(errorMsg);
          }
          toast.error('API通信エラーが発生しました');
          setIsLoading(false);
          return;
        }
        
        // PayPalの場合は直接成功ページにリダイレクト
        if (paymentMethod === 'paypal' && data.approvalUrl) {
          console.log('PayPalリダイレクト先:', data.approvalUrl);
          
          // リダイレクト前に処理中を表示
          toast.success('PayPalへリダイレクトします...');
          setIsLoading(true);
          
          // メッセージを表示してからリダイレクト
          setErrorMessage('PayPalへリダイレクトしています。ブラウザが自動でリダイレクトしない場合は「支払いへ進む」ボタンをもう一度クリックしてください。');
          
          try {
            // リダイレクト実行（少し遅延を入れる）
            setTimeout(() => {
              // 現在のウィンドウでリダイレクト
              window.location.href = data.approvalUrl;
            }, 1500);
          } catch (redirectError) {
            console.error('リダイレクトエラー:', redirectError);
            setErrorMessage(`PayPalへのリダイレクトに失敗しました。手動でこのURLを開いてください: ${data.approvalUrl}`);
            setIsLoading(false);
          }
          
          return;
        }

        // Stripeの場合はチェックアウトページにリダイレクト
        if (!data?.sessionId) {
          const error = 'セッションIDが取得できませんでした';
          setErrorMessage(`${error}\n受信データ: ${JSON.stringify(data)}`);
          toast.error(error);
          setIsLoading(false);
          return;
        }

        // Stripeの読み込み
        const stripe = await stripePromise;

        if (!stripe) {
          const error = 'Stripeの読み込みに失敗しました';
          setErrorMessage(error);
          toast.error(error);
          setIsLoading(false);
          return;
        }

        // Stripeチェックアウトへリダイレクト
        const result = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (result.error) {
          const errorMsg = `Stripeエラー: ${result.error.message || '不明なエラー'}`;
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        } else {
          // 正常にリダイレクトされたらダイアログを閉じる
          setOpen(false);
        }
      } catch (apiError: any) {
        const errorMsg = `API通信エラー: ${apiError.message || '不明なエラー'}`;
        setErrorMessage(errorMsg);
        toast.error('サーバーとの通信に失敗しました');
        setIsLoading(false);
      }
    } catch (error: any) {
      const errorMsg = `支払い処理エラー: ${error.message || '不明なエラー'}`;
      setErrorMessage(errorMsg);
      toast.error('支払い処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        // ダイアログが閉じられたらエラーメッセージをクリア
        setErrorMessage(null);
        setAmount('');
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>資金を追加</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>資金を追加</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              type="number"
              placeholder="金額を入力 (円)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              step="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              最低金額: 100円
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>決済方法を選択</Label>
            <RadioGroup 
              defaultValue={paymentMethod} 
              value={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'paypal')}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe" className="flex items-center">
                  <span className="mr-2">Stripe</span>
                  <img src="/stripe_logo.png" alt="Stripe" className="h-4" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex items-center">
                  <span className="mr-2">PayPal</span>
                  <img src="/paypal_logo.png" alt="PayPal" className="h-5" />
                </Label>
              </div>
            </RadioGroup>
            
            {paymentMethod === 'stripe' && (
              <p className="text-xs text-gray-500 mt-1">
                テスト用クレジットカード: 4242 4242 4242 4242<br />
                有効期限: 任意の将来の日付 / CVV: 任意の3桁
              </p>
            )}
          </div>
          
          {errorMessage && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200 overflow-auto max-h-32">
              {errorMessage}
            </div>
          )}
          
          <Button
            onClick={handleAddFunds}
            disabled={isLoading || !amount || parseInt(amount) < 100}
            className="w-full"
          >
            {isLoading ? '処理中...' : '支払いへ進む'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 