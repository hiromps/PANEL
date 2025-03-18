import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createPayPalOrder } from '@/lib/paypal';

// 静的エクスポートと競合しない設定
export const dynamic = 'auto';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  // CORSヘッダーを設定
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // PREFLIGHTリクエストへの対応
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { headers, status: 204 });
  }

  try {
    // リクエストボディを解析
    const body = await req.json();
    const { amount, paymentMethod = 'stripe' } = body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return new NextResponse(
        JSON.stringify({ error: '有効な金額を指定してください' }),
        { 
          status: 400,
          headers
        }
      );
    }

    // 決済方法に応じた処理
    if (paymentMethod === 'paypal') {
      return await handlePayPalPayment(amount, headers);
    } else {
      return await handleStripePayment(amount, headers);
    }
  } catch (error: any) {
    // 一般エラー（JSONパースエラーなど）
    console.error('支払いセッション作成の一般エラー:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: '支払いセッションの作成に失敗しました', 
        message: error.message,
        success: false
      }),
      { 
        status: 500,
        headers
      }
    );
  }
}

// Stripe決済処理
async function handleStripePayment(amount: number, headers: Record<string, string>) {
  // Stripe APIキー確認
  if (!process.env.STRIPE_SECRET_KEY) {
    return new NextResponse(
      JSON.stringify({ error: 'Stripe設定エラー: APIキーが設定されていません' }),
      { 
        status: 500,
        headers
      }
    );
  }
  
  try {
    // Stripeセッション作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: '資金追加',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-cancel`,
      metadata: {
        originalAmount: amount.toString()
      }
    });
    
    return new NextResponse(
      JSON.stringify({ 
        sessionId: session.id, 
        success: true,
        amount: amount,
        provider: 'stripe'
      }), 
      { 
        status: 200, 
        headers
      }
    );
  } catch (stripeError: any) {
    // Stripeの特定エラー
    return new NextResponse(
      JSON.stringify({ 
        error: `Stripeエラー: ${stripeError.message}`,
        details: stripeError.type,
        success: false
      }),
      { 
        status: 500,
        headers
      }
    );
  }
}

// PayPal決済処理
async function handlePayPalPayment(amount: number, headers: Record<string, string>) {
  try {
    // PayPal注文を作成
    const paypalOrder = await createPayPalOrder(amount);
    
    return new NextResponse(
      JSON.stringify({ 
        success: true,
        amount: amount,
        provider: 'paypal',
        orderId: paypalOrder.id,
        approvalUrl: paypalOrder.approvalUrl // 既にapprovalUrlが設定されている
      }), 
      { 
        status: 200, 
        headers
      }
    );
  } catch (paypalError: any) {
    console.error('PayPal処理エラー:', paypalError);
    
    return new NextResponse(
      JSON.stringify({ 
        error: `PayPalエラー: ${paypalError.message}`,
        success: false
      }),
      { 
        status: 500,
        headers
      }
    );
  }
} 