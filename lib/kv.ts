import { Redis } from '@upstash/redis';
import type {
  Student,
  ScoreItem,
  ScoreRecord,
  ExchangeRecord,
  Config,
} from './types';

// ✅ 方案1：直接用 redis:// 格式的 URL 初始化（Upstash 官方支持）
// 无需手动解析 token/url/端口，彻底避免解析错误
const redis = new Redis({
  url: process.env.student_REDIS_URL as string,
  // 这里留空即可，Upstash 会自动从 redis:// URL 中解析认证信息
  token: '', 
});

// 👇 下面的 getValue/setValue/initData 逻辑完全不变，保留你原来的代码
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
 * 初始化默认数据（保留你的原有代码，无需修改）
 */
export async function initData(): Promise<void> {
  // 👇 这里粘贴你原来的 initData 逻辑，完全不变
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