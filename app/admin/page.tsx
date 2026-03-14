import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { initData, getValue, setValue } from '../../lib/kv';
import { logout } from '../../lib/auth';
import type {
  Student,
  ScoreItem,
  ScoreRecord,
  ExchangeRecord,
} from '../../lib/types';

/**
 * 新增或更新积分项。
 * @param {FormData} formData 表单数据
 * @returns {Promise<void>} 无返回
 */
async function saveScoreItem(formData: FormData): Promise<void> {
  'use server';
  const id = (formData.get('id') as string) || '';
  const subject = formData.get('subject') as ScoreItem['subject'];
  const name = (formData.get('name') as string)?.trim();
  const points = Number(formData.get('points') || 0);

  if (!subject || !name || !points) return;

  const items = await getValue<ScoreItem[]>('scoreItems', []);
  const now = Date.now().toString();

  let next: ScoreItem[];
  if (id) {
    next = items.map((item) =>
      item.id === id ? { ...item, subject, name, points } : item,
    );
  } else {
    next = [
      ...items,
      {
        id: `item-${now}`,
        subject,
        name,
        points,
      },
    ];
  }

  await setValue('scoreItems', next);
  redirect('/admin');
}

/**
 * 删除积分项。
 * @param {FormData} formData 表单数据
 * @returns {Promise<void>} 无返回
 */
async function deleteScoreItem(formData: FormData): Promise<void> {
  'use server';
  const id = formData.get('id') as string;
  if (!id) return;

  const items = await getValue<ScoreItem[]>('scoreItems', []);
  const next = items.filter((item) => item.id !== id);
  await setValue('scoreItems', next);
  redirect('/admin');
}

/**
 * 录入分数。
 * @param {FormData} formData 表单数据
 * @returns {Promise<void>} 无返回
 */
async function addScore(formData: FormData): Promise<void> {
  'use server';
  const studentId = formData.get('student') as string;
  const itemId = formData.get('item') as string;
  const week = (formData.get('week') as string) || '';

  const students = await getValue<Student[]>('students', []);
  const items = await getValue<ScoreItem[]>('scoreItems', []);
  const records = await getValue<ScoreRecord[]>('scoreRecords', []);

  const student = students.find((s) => s.id === studentId);
  const item = items.find((i) => i.id === itemId);
  if (!student || !item || !week) return;

  student.totalPoints += item.points;
  student.subjectPoints[item.subject] += item.points;

  const record: ScoreRecord = {
    id: `score-${Date.now().toString()}`,
    studentId,
    itemId,
    week,
    points: item.points,
    createTime: new Date().toLocaleString(),
  };

  await setValue('students', students);
  await setValue('scoreRecords', [...records, record]);
  redirect('/admin');
}

/**
 * 兑换积分。
 * @param {FormData} formData 表单数据
 * @returns {Promise<void>} 无返回
 */
async function exchangePoints(formData: FormData): Promise<void> {
  'use server';
  const studentId = formData.get('student') as string;
  const num = Number(formData.get('num') || 0);
  const reason = (formData.get('reason') as string) || '';

  const students = await getValue<Student[]>('students', []);
  const exRecords = await getValue<ExchangeRecord[]>('exchangeRecords', []);
  const student = students.find((s) => s.id === studentId);
  if (!student || !num || !reason.trim()) return;

  if (num > student.totalPoints) {
    redirect('/admin?error=points-not-enough');
  }

  if (student.totalPoints >= 100) {
    const max = (student.totalPoints * student.exchangeRate) / 100;
    if (num > max) {
      redirect('/admin?error=over-limit');
    }
  }

  student.totalPoints -= num;

  const record: ExchangeRecord = {
    id: `exchange-${Date.now().toString()}`,
    studentId,
    points: num,
    reason,
    createTime: new Date().toLocaleString(),
  };

  await setValue('students', students);
  await setValue('exchangeRecords', [...exRecords, record]);
  redirect('/admin');
}

/**
 * 更新学生兑换比例。
 * @param {FormData} formData 表单数据
 * @returns {Promise<void>} 无返回
 */
async function updateExchangeRate(formData: FormData): Promise<void> {
  'use server';
  const studentId = formData.get('studentId') as string;
  const rate = Number(formData.get('exchangeRate') || 0);
  if (!studentId || !rate) return;

  const students = await getValue<Student[]>('students', []);
  const next = students.map((s) =>
    s.id === studentId ? { ...s, exchangeRate: rate } : s,
  );
  await setValue('students', next);
  redirect('/admin');
}

/**
 * 退出登录。
 * @returns {Promise<void>} 无返回
 */
async function doLogout(): Promise<void> {
  'use server';
  await logout();
  redirect('/');
}

/**
 * 管理后台页面：积分项管理、录分数、积分兑换、修改密码等。
 * @returns {Promise<JSX.Element>} 页面 JSX
 */
export default async function AdminPage(): Promise<React.JSX.Element> {
  await initData();

  const token = cookies().get('admin_token');
  if (!token) {
    redirect('/login');
  }

  const [students, items] = await Promise.all([
    getValue<Student[]>('students', []),
    getValue<ScoreItem[]>('scoreItems', []),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">⚙️ 管理后台</h1>
        <form action={doLogout}>
          <button className="btn btn-danger px-4 py-2 text-sm md:text-base">
            登出
          </button>
        </form>
      </div>

      <section className="card">
        <h2 className="text-lg font-semibold mb-3">📌 积分项管理</h2>
        <div className="space-y-3">
          <form action={saveScoreItem} className="grid gap-2 md:grid-cols-4">
            <select
              name="subject"
              className="p-2 border rounded text-sm md:text-base"
              required
            >
              <option value="语文">语文</option>
              <option value="数学">数学</option>
              <option value="英语">英语</option>
            </select>
            <input
              name="name"
              placeholder="积分项名称"
              className="p-2 border rounded text-sm md:text-base"
              required
            />
            <input
              name="points"
              type="number"
              placeholder="分值"
              className="p-2 border rounded text-sm md:text-base"
              required
            />
            <button className="btn btn-success w-full md:w-auto text-sm md:text-base">
              新增积分项
            </button>
          </form>

          <div className="max-h-80 overflow-y-auto border rounded-md p-2 bg-gray-50">
            {['语文', '数学', '英语'].map((subject) => (
              <div key={subject} className="mb-3">
                <h3 className="font-medium mb-1 text-sm md:text-base">
                  {subject}
                </h3>
                <div className="space-y-1">
                  {items
                    .filter((i) => i.subject === subject)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 text-xs md:text-sm"
                      >
                        <span className="flex-1 truncate">
                          {item.name}（+{item.points}）
                        </span>
                        <form
                          action={deleteScoreItem}
                          className="shrink-0 flex items-center gap-1"
                        >
                          <input type="hidden" name="id" value={item.id} />
                          <button className="text-red-500 text-xs md:text-sm">
                            删除
                          </button>
                        </form>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-3">✏️ 录入分数</h2>
        <form
          action={addScore}
          className="space-y-3 md:grid md:grid-cols-4 md:gap-3 md:space-y-0"
        >
          <select
            name="student"
            className="w-full p-2 border rounded text-sm md:text-base"
            required
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            name="item"
            className="w-full p-2 border rounded text-sm md:text-base"
            required
          >
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.subject}-{i.name} (+{i.points})
              </option>
            ))}
          </select>
          <input
            name="week"
            defaultValue={today}
            className="w-full p-2 border rounded text-sm md:text-base"
            required
          />
          <button className="btn btn-primary w-full md:w-auto text-sm md:text-base">
            确认录入
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-3">💱 积分兑换</h2>
        <form
          action={exchangePoints}
          className="space-y-3 md:grid md:grid-cols-4 md:gap-3 md:space-y-0"
        >
          <select
            name="student"
            className="w-full p-2 border rounded text-sm md:text-base"
            required
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}（总积分：{s.totalPoints}）
              </option>
            ))}
          </select>
          <input
            name="num"
            type="number"
            min={1}
            placeholder="兑换积分"
            className="w-full p-2 border rounded text-sm md:text-base"
            required
          />
          <input
            name="reason"
            placeholder="兑换原因"
            className="w-full p-2 border rounded text-sm md:text-base"
            required
          />
          <button className="btn btn-success w-full md:w-auto text-sm md:text-base">
            确认兑换
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-500 md:text-sm">
          提示：总积分小于 100 时无限制；总积分大于等于 100 时，陈姝淼最多兑换总积分的 40%，陈书辰最多兑换总积分的
          50%（可在下面修改）。
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-3">⚖️ 兑换比例设置</h2>
        <div className="space-y-3">
          {students.map((s) => (
            <form
              key={s.id}
              action={updateExchangeRate}
              className="flex items-center gap-2 flex-wrap text-sm md:text-base"
            >
              <span className="w-20">{s.name}</span>
              <input type="hidden" name="studentId" value={s.id} />
              <input
                name="exchangeRate"
                type="number"
                defaultValue={s.exchangeRate}
                className="w-24 p-2 border rounded text-sm md:text-base"
              />
              <span>%（总积分可兑换上限）</span>
              <button className="btn btn-primary px-3 py-1 text-xs md:text-sm">
                保存
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
