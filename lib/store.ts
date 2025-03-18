import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BalanceState {
  balance: number;
  isProcessing: boolean;
  addFunds: (amount: number, sessionId?: string) => void;
  deductFunds: (amount: number, sessionId?: string) => boolean;
  resetBalance: () => void;
  lastTransaction: {
    id: string | null;
    sessionId: string | null;
    amount: number;
    timestamp: number;
  };
}

export const useBalanceStore = create<BalanceState>()(
  persist(
    (set, get) => ({
      balance: 0,
      isProcessing: false,
      lastTransaction: {
        id: null,
        sessionId: null,
        amount: 0,
        timestamp: 0
      },
      
      addFunds: (amount: number, sessionId?: string) => {
        // 処理中や金額の検証
        if (get().isProcessing) {
          return;
        }
        
        // 同一セッションIDの取引チェック
        const lastTx = get().lastTransaction;
        if (sessionId && lastTx.sessionId === sessionId) {
          return;
        }
        
        // 金額の検証
        if (!amount || isNaN(amount) || amount <= 0) {
          return;
        }
        
        // 処理開始
        set({ isProcessing: true });
        
        try {
          const oldBalance = get().balance;
          const newBalance = oldBalance + amount;
          
          // 残高と取引情報を更新
          set({ 
            balance: newBalance,
            lastTransaction: {
              id: `add-${Date.now()}`,
              sessionId: sessionId || null,
              amount: amount,
              timestamp: Date.now()
            }
          });
        } finally {
          // 処理完了フラグをリセット
          setTimeout(() => {
            set({ isProcessing: false });
          }, 50);
        }
      },
      
      deductFunds: (amount: number, sessionId?: string) => {
        // 処理中や金額の検証
        if (get().isProcessing) {
          return false;
        }
        
        // 同一セッションIDの取引チェック
        const lastTx = get().lastTransaction;
        if (sessionId && lastTx.sessionId === sessionId) {
          return false;
        }
        
        let success = false;
        
        // 金額の検証
        if (!amount || isNaN(amount) || amount <= 0) {
          return false;
        }
        
        // 処理開始
        set({ isProcessing: true });
        
        try {
          const currentBalance = get().balance;
          
          // 残高チェック
          if (currentBalance >= amount) {
            const newBalance = currentBalance - amount;
            
            // 残高と取引情報を更新
            set({ 
              balance: newBalance,
              lastTransaction: {
                id: `deduct-${Date.now()}`,
                sessionId: sessionId || null,
                amount: -amount,
                timestamp: Date.now()
              }
            });
            
            success = true;
          }
        } finally {
          // 処理完了フラグをリセット
          setTimeout(() => {
            set({ isProcessing: false });
          }, 50);
        }
        
        return success;
      },
      
      resetBalance: () => {
        set({ 
          balance: 0,
          lastTransaction: {
            id: `reset-${Date.now()}`,
            sessionId: null,
            amount: 0,
            timestamp: Date.now()
          }
        });
      },
    }),
    {
      name: 'balance-storage',
    }
  )
);

// 連続ログイン状態の型定義
interface LoginStreakState {
  streak: number;              // 連続ログイン日数
  lastLoginDate: string;       // 最後のログイン日（YYYY-MM-DD形式）
  checkLoginStreak: () => void; // 連続ログインをチェックし更新する関数
}

// 日付をYYYY-MM-DD形式の文字列に変換する関数
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 今日の日付をYYYY-MM-DD形式で取得
const getTodayFormatted = (): string => {
  return formatDate(new Date());
};

// 昨日の日付をYYYY-MM-DD形式で取得
const getYesterdayFormatted = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
};

// 連続ログイン情報を管理するストア
export const useLoginStreakStore = create<LoginStreakState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastLoginDate: '',
      
      checkLoginStreak: () => {
        const today = getTodayFormatted();
        const yesterday = getYesterdayFormatted();
        const { lastLoginDate, streak } = get();
        
        // すでに今日ログインしている場合は何もしない
        if (lastLoginDate === today) {
          return;
        }
        
        // 初回ログインまたは連続ログインが途切れた場合
        if (!lastLoginDate || (lastLoginDate !== yesterday && lastLoginDate !== today)) {
          set({ 
            streak: 1, 
            lastLoginDate: today 
          });
          return;
        }
        
        // 昨日ログインしていた場合、連続ログイン日数を増やす
        if (lastLoginDate === yesterday) {
          const newStreak = streak + 1;
          set({ 
            streak: newStreak, 
            lastLoginDate: today 
          });
          
          // 7日連続ログインでボーナス付与
          if (newStreak % 7 === 0) {
            // バランスストアからボーナス追加メソッドを呼び出す
            const balanceStore = useBalanceStore.getState();
            balanceStore.addFunds(100, `login-streak-bonus-${Date.now()}`);
          }
        }
      }
    }),
    {
      name: 'login-streak-storage',
    }
  )
); 