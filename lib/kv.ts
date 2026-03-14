'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/kv';
import { updatePassword, logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('points');

  useEffect(() => { loadData(); }, []);
  async function loadData() {
    setStudents(await db.get('students'));
    setItems(await db.get('scoreItems'));
  }

  // 录入分数
  async function addScore(e) {
    e.preventDefault();
    const sId = e.target.student.value;
    const itemId = e.target.item.value;
    const week = e.target.week.value;
    const item = items.find(i => i.id === itemId);
    const s = students.find(s => s.id === sId);
    
    s.totalPoints += item.points;
    s.subjectPoints[item.subject] += item.points;
    
    const records = await db.get('scoreRecords');
    records.push({ id: Date.now().toString(), studentId: sId, itemId, week, points: item.points, createTime: new Date().toLocaleString() });
    
    await db.set('students', students);
    await db.set('scoreRecords', records);
    loadData(); alert('录入成功');
  }

  // 积分兑换
  async function exchange(e) {
    e.preventDefault();
    const sId = e.target.student.value;
    const num = Number(e.target.num.value);
    const reason = e.target.reason.value;
    const s = students.find(s => s.id === sId);

    if (num > s.totalPoints) return alert('积分不足');
    if (s.totalPoints >= 100) {
      const max = s.totalPoints * (s.exchangeRate / 100);
      if (num > max) return alert(`超出限制！最多可兑换${max.toFixed(0)}分`);
    }

    s.totalPoints -= num;
    const ex = await db.get('exchangeRecords');
    ex.push({ id: Date.now().toString(), studentId: sId, points: num, reason, createTime: new Date().toLocaleString() });
    
    await db.set('students', students);
    await db.set('exchangeRecords', ex);
    loadData(); alert('兑换成功');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">⚙️ 管理后台</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setTab('points')} className="btn btn-primary">录分数</button>
        <button onClick={() => setTab('exchange')} className="btn btn-success">兑积分</button>
        <button onClick={() => setTab('settings')} className="btn">改密码</button>
        <button onClick={() => { logout(); router.push('/'); }} className="btn btn-danger">登出</button>
      </div>

      {/* 录分数 */}
      {tab === 'points' && (
        <form onSubmit={addScore} className="card space-y-3">
          <select name="student" className="w-full p-2 border" required>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select name="item" className="w-full p-2 border" required>
            {items.map(i => <option key={i.id} value={i.id}>{i.subject}-{i.name} (+{i.points})</option>)}
          </select>
          <input name="week" defaultValue={new Date().toISOString().slice(0,10)} className="w-full p-2 border" />
          <button className="btn btn-primary w-full">确认录入</button>
        </form>
      )}

      {/* 兑积分 */}
      {tab === 'exchange' && (
        <form onSubmit={exchange} className="card space-y-3">
          <select name="student" className="w-full p-2 border" required>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}（总积分：{s.totalPoints}）</option>)}
          </select>
          <input name="num" type="number" placeholder="兑换积分" className="w-full p-2 border" required />
          <input name="reason" placeholder="兑换原因" className="w-full p-2 border" required />
          <button className="btn btn-success w-full">确认兑换</button>
        </form>
      )}

      {/* 改密码 */}
      {tab === 'settings' && (
        <div className="card">
          <form onSubmit={async e => { e.preventDefault(); await updatePassword(e.target.pwd.value); alert('修改成功'); }}>
            <input name="pwd" type="password" placeholder="新密码" className="w-full p-2 border mb-3" required />
            <button className="btn btn-primary w-full">修改密码</button>
          </form>
        </div>
      )}
    </div>
  );
}