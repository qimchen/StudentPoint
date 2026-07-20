// 学生
export interface Student {
  id: string;
  name: string;
  exchangeRate: number;
  totalPoints: number;
  subjectPoints: {
    语文: number;
    数学: number;
    英语: number;
  };
  avatarUrl?: string;
  // 贷款默认周利率（小数，0.025 = 2.5%）。未设置时按 0.025 处理
  weeklyInterestRate?: number;
}

// 积分项
export interface ScoreItem {
  id: string;
  subject: '语文' | '数学' | '英语';
  name: string;
  points: number;
}

// 分数记录
export interface ScoreRecord {
  id: string;
  studentId: string;
  itemId: string;
  subject: '语文' | '数学' | '英语';
  week: string;
  points: number;
  createTime: string;
}

// 兑换记录
export interface ExchangeRecord {
  id: string;
  studentId: string;
  points: number;
  reason: string;
  createTime: string;
  subjectPoints?: {
    语文: number;
    数学: number;
    英语: number;
  };
}

// 管理员配置
export interface Config {
  password: string;
}

// 还款记录
export interface Repayment {
  id: string;
  amount: number;
  time: string;          // 'YYYY-MM-DD HH:mm:ss'
  timestamp: number;
}

// 贷款
export interface Loan {
  id: string;                    // 'loan-{timestamp}'
  studentId: string;
  principal: number;             // 初始本金
  currentPrincipal: number;      // 当前剩余本金（结息后含累计利息，随还款递减）
  weeklyInterestRate: number;    // 周利率（小数，0.025 = 2.5%）
  borrowTime: string;            // 'YYYY-MM-DD HH:mm:ss'
  borrowTimestamp: number;
  lastResetTimestamp: number;    // 上次结息时间戳
  status: 'active' | 'closed';
  repayments: Repayment[];
  purpose: string;               // 借款用途
  // 合同签署
  contractSigned?: boolean;
  contractSignTime?: string;     // 'YYYY-MM-DD HH:mm:ss'
  contractSigner?: string;       // 签署人姓名
}