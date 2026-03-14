import { Redis } from '@upstash/redis';
import type {
  Student,
  ScoreItem,
  ScoreRecord,
  ExchangeRecord,
  Config,
} from './types';

/** @typedef {'students' | 'scoreItems' | 'scoreRecords' | 'exchangeRecords' | 'config'} KvKey */

const redis = new Redis({
  // 这里使用 Vercel Redis / Upstash 在项目中自动注入的环境变量名称
  url: process.env.student_REDIS_URL as string,
  token: process.env.student_REDIS_TOKEN as string,
});

/**
 * 获取指定 key 的值，如果不存在则返回默认值。
 * @template T
 * @param {KvKey} key KV 存储键名
 * @param {T} fallback 默认值
 * @returns {Promise<T>} 实际存储的值或默认值
 */
export async function getValue<T>(key: 'students', fallback: T): Promise<T>;
export async function getValue<T>(key: 'scoreItems', fallback: T): Promise<T>;
export async function getValue<T>(key: 'scoreRecords', fallback: T): Promise<T>;
export async function getValue<T>(key: 'exchangeRecords', fallback: T): Promise<T>;
export async function getValue<T>(key: 'config', fallback: T): Promise<T>;
export async function getValue<T>(key: string, fallback: T): Promise<T> {
  const value = await redis.get<T>(key);
  return (value ?? fallback) as T;
}

/**
 * 写入 KV。
 * @param {KvKey} key KV 存储键名
 * @param {unknown} value 要写入的值
 * @returns {Promise<void>} 无返回
 */
export async function setValue(
  key: 'students' | 'scoreItems' | 'scoreRecords' | 'exchangeRecords' | 'config',
  value: unknown,
): Promise<void> {
  await redis.set(key, value);
}

/**
 * 初始化默认数据：两个学生、默认积分项、空记录以及默认管理员密码。
 * 在首页渲染和部分 server action 中调用，确保数据结构存在。
 * @returns {Promise<void>} 无返回
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
