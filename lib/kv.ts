import { createClient } from '@vercel/kv';
import type {
  Student,
  ScoreItem,
  ScoreRecord,
  ExchangeRecord,
  Config,
} from './types';

// ✅ 核心：解析 Vercel 自动注入的 student_REDIS_URL
const redisUrl = process.env.student_REDIS_URL;
if (!redisUrl) {
  throw new Error('student_REDIS_URL 环境变量未配置，请检查 Vercel Redis 连接');
}

// 解析 redis://default:<TOKEN>@<HOST>:<PORT> 格式
const urlParts = redisUrl.replace('redis://', '').split('@');
const token = urlParts[0].split(':')[1]; // 提取 Token
const [host, port] = urlParts[1].split(':'); // 提取 HOST 和 PORT

// 手动创建 @vercel/kv 客户端（适配 student_REDIS_URL）
const kv = createClient({
  url: `https://${host}:${port}`,
  token: token,
});

/**
 * 获取指定 key 的值，如果不存在则返回默认值。
 */
export async function getValue<T>(key: string, fallback: T): Promise<T> {
  const value = await kv.get<T>(key);
  return (value ?? fallback) as T;
}

/**
 * 写入 KV。
 */
export async function setValue(
  key: 'students' | 'scoreItems' | 'scoreRecords' | 'exchangeRecords' | 'config',
  value: unknown,
): Promise<void> {
  await kv.set(key, value);
}

/**
 * 初始化默认数据（逻辑不变）
 */
export async function initData(): Promise<void> {
  const students = await getValue<Student[]>('students', []);
  const scoreItems = await getValue<ScoreItem[]>('scoreItems', []);
  const config = await getValue<Config>('config', { password: '' });

  if (students.length === 0) {
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
    await setValue('students', defaultStudents);
  }

  if (scoreItems.length === 0) {
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
    await setValue('scoreItems', defaultItems);
  }

  if (!config.password) {
    const defaultConfig: Config = {
      password: 'admin123',
    };
    await setValue('config', defaultConfig);
  }

  const scoreRecords = await getValue<ScoreRecord[]>('scoreRecords', []);
  if (scoreRecords.length === 0) {
    await setValue('scoreRecords', []);
  }

  const exchangeRecords = await getValue<ExchangeRecord[]>('exchangeRecords', []);
  if (exchangeRecords.length === 0) {
    await setValue('exchangeRecords', []);
  }
}