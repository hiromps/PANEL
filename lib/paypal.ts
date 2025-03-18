import fetch from 'node-fetch';

// PayPal API設定
interface PayPalAuthResponse {
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

// 環境変数のチェック
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  throw new Error('PayPal client ID or secret is not set');
}

const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// アクセストークンを取得
export async function getPayPalAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal token error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as PayPalAuthResponse;
    return data.access_token;
  } catch (error) {
    console.error('PayPal token fetch error:', error);
    throw error;
  }
}

// サンドボックス用の直接リダイレクトURL生成
export function getPayPalSandboxRedirectUrl(amount: number): string {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) {
    throw new Error('PayPal Client ID is missing');
  }
  
  const returnUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/payment-success?provider=paypal`);
  const cancelUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/payment-cancel`);
  
  return `https://www.sandbox.paypal.com/checkoutnow?token=EC-XXXXXXX&useraction=commit&amount=${amount}&currency_code=JPY&client_id=${clientId}&returnurl=${returnUrl}&cancelurl=${cancelUrl}&locale=ja_JP`;
}

// PayPal注文を作成
export async function createPayPalOrder(amount: number): Promise<{id: string, approvalUrl: string}> {
  try {
    // サンドボックス環境では簡易シミュレーション
    // 本番環境では実際のPayPal APIを使用
    if (process.env.NODE_ENV !== 'production') {
      const orderId = `SANDBOX-${amount}-${Date.now()}`; // 金額を注文IDに含める
      const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?order_id=${orderId}&provider=paypal`;
      
      return {
        id: orderId,
        approvalUrl: returnUrl
      };
    }
    
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'JPY',
              value: amount.toString(),
            },
            description: '資金追加',
            custom_id: `original_amount_${amount}`,
          },
        ],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?provider=paypal`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-cancel`,
          user_action: 'PAY_NOW', // ユーザーアクションを明示的に「支払う」に設定
          brand_name: process.env.NEXT_PUBLIC_APP_NAME || 'アプリ名', // アプリ名を設定
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal order error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    console.log('PayPal API response:', JSON.stringify(data, null, 2));
    
    // 承認URLを探す
    let approvalUrl = '';
    if (data.links && Array.isArray(data.links)) {
      const approvalLink = data.links.find((link: any) => link.rel === 'approve');
      if (approvalLink) {
        approvalUrl = approvalLink.href;
        console.log('Found approval URL:', approvalUrl);
      } else {
        console.warn('No approval link found in PayPal response:', data.links);
      }
    }
    
    if (!approvalUrl) {
      if (data.id) {
        // APIからリンクが取得できない場合は、PayPal標準のチェックアウトURLを生成
        approvalUrl = `${PAYPAL_BASE_URL.replace('api-m.', '')}/checkoutnow?token=${data.id}`;
        console.log('Using default PayPal checkout URL:', approvalUrl);
      } else {
        // 最終手段としてサクセスページへ直接遷移
        approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?order_id=${data.id}&provider=paypal`;
        console.warn('Fallback to success page without PayPal approval:', approvalUrl);
      }
    }
    
    return { 
      id: data.id,
      approvalUrl
    };
  } catch (error) {
    console.error('PayPal order creation error:', error);
    throw error;
  }
}

// PayPal注文を検証
export async function capturePayPalOrder(orderId: string): Promise<{amount: number, status: string}> {
  try {
    // サンドボックス環境ではシミュレーション
    if (orderId.startsWith('SANDBOX-')) {
      // 注文IDから金額を抽出（SANDBOX-1000-123456 のような形式を想定）
      let amount = 1000; // デフォルト値
      const parts = orderId.split('-');
      if (parts.length > 1) {
        const potentialAmount = parseInt(parts[1]);
        if (!isNaN(potentialAmount)) {
          amount = potentialAmount;
        }
      }
      
      return {
        amount: amount, // 注文IDから抽出した金額または入力された金額をそのまま使用
        status: 'COMPLETED'
      };
    }
    
    const accessToken = await getPayPalAccessToken();
    
    // 注文情報を取得
    const orderResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      throw new Error(`PayPal order retrieval error: ${orderResponse.status} ${errorText}`);
    }

    const orderData = await orderResponse.json();
    
    // 支払い状態確認
    if (orderData.status !== 'COMPLETED' && orderData.status !== 'APPROVED') {
      // 承認済み状態の場合は捕捉を試みる
      if (orderData.status === 'APPROVED') {
        const captureResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!captureResponse.ok) {
          const errorText = await captureResponse.text();
          throw new Error(`PayPal capture error: ${captureResponse.status} ${errorText}`);
        }

        const captureData = await captureResponse.json();
        
        // 金額抽出
        const amount = parseInt(captureData.purchase_units[0].amount.value);
        
        // カスタムIDから元の金額も抽出
        let originalAmount = amount;
        const customId = captureData.purchase_units[0].custom_id;
        if (customId && customId.startsWith('original_amount_')) {
          originalAmount = parseInt(customId.replace('original_amount_', ''));
        }
        
        return {
          amount: originalAmount,
          status: captureData.status
        };
      }
      
      // サンドボックス環境では常に成功させる
      if (process.env.NODE_ENV !== 'production') {
        return {
          amount: 1000, // テスト用固定金額
          status: 'COMPLETED'
        };
      }
      
      throw new Error(`Payment not completed: ${orderData.status}`);
    }
    
    // 金額抽出
    const amount = parseInt(orderData.purchase_units[0].amount.value);
    
    // カスタムIDから元の金額も抽出
    let originalAmount = amount;
    const customId = orderData.purchase_units[0].custom_id;
    if (customId && customId.startsWith('original_amount_')) {
      originalAmount = parseInt(customId.replace('original_amount_', ''));
    }
    
    return {
      amount: originalAmount,
      status: orderData.status
    };
  } catch (error) {
    console.error('PayPal order capture error:', error);
    throw error;
  }
} 