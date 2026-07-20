import { getRequestContext } from '@cloudflare/next-on-pages';
import type {
  Student,
  ScoreItem,
  ScoreRecord,
  ExchangeRecord,
  Config,
} from './types';

// ✅ 使用 Cloudflare KV（Pages 项目已绑定 KV_NAMESPACE）
// Edge Runtime 通过 getRequestContext().env 访问绑定资源
declare global {
  interface Env {
    KV_NAMESPACE: KVNamespace;
  }
}

function kv(): KVNamespace {
  return getRequestContext().env.KV_NAMESPACE;
}

/**
 * 获取指定 key 的值（KV 中存储 JSON 字符串，需手动反序列化）
 */
export async function getValue<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await kv().get(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch (error) {
    console.error('KV 获取数据失败:', error);
    return fallback;
  }
}

/**
 * 写入 KV（手动序列化为 JSON 字符串）
 */
export async function setValue(
  key: 'students' | 'scoreItems' | 'scoreRecords' | 'exchangeRecords' | 'config',
  value: unknown,
): Promise<void> {
  try {
    await kv().put(key, JSON.stringify(value));
  } catch (error) {
    console.error('KV 写入数据失败:', error);
    throw error;
  }
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
