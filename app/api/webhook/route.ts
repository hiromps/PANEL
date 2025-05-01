import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const event = await req.json();

    // Webhookイベントの処理
    switch (event.type) {
      case 'payment_intent.succeeded':
        // 支払い成功時の処理
        console.log('PaymentIntent was successful!');
        break;
      case 'payment_intent.payment_failed':
        // 支払い失敗時の処理
        console.log('PaymentIntent failed!');
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 400 });
  }
}