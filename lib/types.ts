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