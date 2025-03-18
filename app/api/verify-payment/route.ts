import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { capturePayPalOrder } from '@/lib/paypal';

export async function POST(req: Request) {
  try {
    const { sessionId, orderId, provider = 'stripe', token } = await req.json();

    // プロバイダに応じた検証
    if (provider === 'paypal') {
      // PayPalはorderIdまたはtoken（PayPalからの返却値）で検証可能
      const paypalId = orderId || token;
      
      if (!paypalId) {
        return NextResponse.json(
          { error: 'PayPal注文IDまたはトークンが必要です' },
          { status: 400 }
        );
      }
      
      // PayPal注文の検証
      return await verifyPayPalPayment(paypalId);
    } else {
      // Stripe決済の検証
      if (!sessionId) {
        return NextResponse.json(
          { error: 'セッションIDが必要です' },
          { status: 400 }
        );
      }
      
      return await verifyStripePayment(sessionId);
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        error: '支払い検証に失敗しました', 
        message: error.message || '不明なエラー'
      },
      { status: 500 }
    );
  }
}

// Stripe決済検証
async function verifyStripePayment(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const amountTotal = session.amount_total || 0;
      
      let correctAmount = 0;
      
      // メタデータから正確な金額を取得
      if (session.metadata?.originalAmount) {
        correctAmount = parseInt(session.metadata.originalAmount);
      } else {
        correctAmount = amountTotal;
      }
      
      return NextResponse.json({ 
        success: true, 
        amount: correctAmount,
        stripeAmount: amountTotal,
        paymentStatus: session.payment_status,
        provider: 'stripe'
      });
    } else {
      return NextResponse.json({ 
        success: false,
        paymentStatus: session.payment_status,
        provider: 'stripe'
      });
    }
  } catch (error) {
    throw error;
  }
}

// PayPal決済検証
async function verifyPayPalPayment(orderId: string) {
  try {
    const result = await capturePayPalOrder(orderId);
    
    if (result.status === 'COMPLETED' || result.status === 'APPROVED') {
      return NextResponse.json({
        success: true,
        amount: result.amount,
        paymentStatus: result.status,
        provider: 'paypal'
      });
    } else {
      return NextResponse.json({
        success: false,
        paymentStatus: result.status,
        provider: 'paypal'
      });
    }
  } catch (error) {
    throw error;
  }
} 