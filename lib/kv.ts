import { Redis } from '@upstash/redis';
import type {
  Student,
  ScoreItem,
  ScoreRecord,
  ExchangeRecord,
  Config,
} from './types';

// ✅ 适配你截图里的 student_REDIS_URL 环境变量
const redisUrl = process.env.student_REDIS_URL as string;
// 从 URL 中解析出 token（密码）
const token = redisUrl.split(':')[2].split('@')[0];
const url = `https://${redisUrl.split('@')[1].split(':')[0]}:${redisUrl.split(':')[4]}`;

// 创建 Redis 客户端
const redis = new Redis({
  url: url,
  token: token,
});

/**
 * 获取指定 key 的值，如果不存在则返回默认值。
 */
export async function getValue<T>(key: string, fallback: T): Promise<T> {
  const value = await redis.get<T>(key);
  return (value ?? fallback) as T;
}

/**
 * 写入 KV。
 */
export async function setValue(
  key: 'students' | 'scoreItems' | 'scoreRecords' | 'exchangeRecords' | 'config',
  value: unknown,
): Promise<void> {
  await redis.set(key, value);
}

/**
 * 初始化默认数据（逻辑不变，保留你的原有代码）
 */
export async function initData(): Promise<void> {
  const students = await redis.get<Student[]>('students');
  const scoreItems = await redis.get<ScoreItem[]>('scoreItems');
  const config = await redis.get<Config>('config');

  if (!students || students.length === 0) {
    const defaultStudents: Student[] = [
      {
        id: 'chen-shumiao',
        name: '陈姝淼',
        exchangeRate: 40,
        totalPoints: 0,
        subjectPoints: { 语文: 0, 数学: 0, 英语: 0 },
      },
      {
        id: 'chen-shuchen',
        name: '陈书辰',
        exchangeRate: 50,
        totalPoints: 0,
        subjectPoints: { 语文: 0, 数学: 0, 英语: 0 },
      },
    ];
    await redis.set('students', defaultStudents);
  }

  if (!scoreItems || scoreItems.length === 0) {
    const baseItems: Array<Omit<ScoreItem, 'id' | 'subject'>> = [
      { name: '课后全对', points: 1 },
      { name: '抄写作业、课堂作业全对', points: 3 },
      { name: '听写、默写全对', points: 7 },
      { name: '练习册全对', points: 30 },
      { name: '周末题单（特色作业）全对', points: 30 },
      { name: '单元考满分', points: 100 },
      { name: '期中考满分', points: 500 },
      { name: '期末考满分', points: 1000 },
    ];

    const subjects: Array<ScoreItem['subject']> = ['语文', '数学', '英语'];
    const defaultItems: ScoreItem[] = [];

    subjects.forEach((subject) => {
      baseItems.forEach((item, index) => {
        defaultItems.push({
          id: `${subject}-${index}`,
          subject,
          name: item.name,
          points: item.points,
        });
      });
    });

    await redis.set('scoreItems', defaultItems);
  }

  if (!config) {
    const defaultConfig: Config = {
      password: 'admin123',
    };
    await redis.set('config', defaultConfig);
  }

  const scoreRecords = await redis.get<ScoreRecord[]>('scoreRecords');
  if (!scoreRecords) {
    await redis.set('scoreRecords', []);
  }

  const exchangeRecords = await redis.get<ExchangeRecord[]>('exchangeRecords');
  if (!exchangeRecords) {
    await redis.set('exchangeRecords', []);
  }
}