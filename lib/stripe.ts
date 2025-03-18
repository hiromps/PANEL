import Stripe from 'stripe';

// APIキーをチェック
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// よく知られている安定バージョンを使用
const STRIPE_API_VERSION = '2023-10-16';

// Stripeインスタンスを作成
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: STRIPE_API_VERSION as any,
  typescript: true,
  appInfo: {
    name: 'SGW Payment',
    version: '1.0.0',
  },
  // タイムアウトを設定
  timeout: 30000, // 30秒
});

export { stripe }; 