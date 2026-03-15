'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '../../lib/auth';
import type { Student, ScoreItem, ScoreRecord, ExchangeRecord } from '../../lib/types';
import ConfirmModal from '../components/ConfirmModal';
import LoadingOverlay, { LoadingSpinner } from '../components/Loading';

type TabType = 'password' | 'items' | 'score' | 'exchange' | 'records';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('score');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [scoreItems, setScoreItems] = useState<ScoreItem[]>([]);
  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>([]);
  const [exchangeRecords, setExchangeRecords] = useState<ExchangeRecord[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, itemsRes, recordsRes, exchangesRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/score-items'),
        fetch('/api/score-records'),
        fetch('/api/exchange-records'),
      ]);
      const [studentsData, itemsData, recordsData, exchangesData] = await Promise.all([
        studentsRes.json(),
        itemsRes.json(),
        recordsRes.json(),
        exchangesRes.json(),
      ]);
      setStudents(studentsData);
      setScoreItems(itemsData);
      setScoreRecords(recordsData);
      setExchangeRecords(exchangesData);
    } catch (error) {
      showToast('数据加载失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'score', label: '录入积分', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    { key: 'exchange', label: '积分兑换', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
    { key: 'items', label: '积分项管理', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
    { key: 'records', label: '记录管理', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { key: 'password', label: '修改密码', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">管理后台</h1>
          <p className="text-sm text-gray-500 mt-1">管理积分项、录入分数、处理兑换</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          退出登录
        </button>
      </div>

      <div className="tab-container flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-item ${activeTab === tab.key ? 'tab-item-active' : 'tab-item-inactive'}`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <LoadingOverlay isLoading={loading} text="加载数据中..." />

      {!loading && (
        <>
          {activeTab === 'password' && (
            <PasswordTab showToast={showToast} />
          )}
          {activeTab === 'items' && (
            <ScoreItemsTab 
              items={scoreItems} 
              onRefresh={fetchData} 
              showToast={showToast} 
            />
          )}
          {activeTab === 'score' && (
            <ScoreEntryTab 
              students={students} 
              items={scoreItems} 
              onRefresh={fetchData} 
              showToast={showToast} 
            />
          )}
          {activeTab === 'exchange' && (
            <ExchangeTab 
              students={students} 
              onRefresh={fetchData} 
              showToast={showToast} 
            />
          )}
          {activeTab === 'records' && (
            <RecordsTab 
              students={students}
              items={scoreItems}
              scoreRecords={scoreRecords}
              exchangeRecords={exchangeRecords}
              onRefresh={fetchData}
              showToast={showToast}
            />
          )}
        </>
      )}

      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function PasswordTab({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 4) {
      showToast('新密码长度至少4位', 'error');
      return;
    }
    if (newPwd !== confirmPwd) {
      showToast('两次输入的密码不一致', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        body: JSON.stringify({ newPassword: newPwd }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('密码修改成功', 'success');
        setCurrentPwd('');
        setNewPwd('');
        setConfirmPwd('');
      } else {
        showToast(data.message || '修改失败', 'error');
      }
    } catch {
      showToast('修改失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card max-w-md">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </span>
        修改密码
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
          <input
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            className="input-control"
            placeholder="请输入新密码（至少4位）"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
          <input
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            className="input-control"
            placeholder="请再次输入新密码"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? <><LoadingSpinner size="sm" /><span className="ml-2">修改中...</span></> : '确认修改'}
        </button>
      </form>
    </div>
  );
}

function ScoreItemsTab({ 
  items, 
  onRefresh, 
  showToast 
}: { 
  items: ScoreItem[]; 
  onRefresh: () => void; 
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ScoreItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '语文' as '语文' | '数学' | '英语',
    name: '',
    points: 1,
  });

  const subjects = ['语文', '数学', '英语'] as const;

  const groupedItems = subjects.map((subject) => ({
    subject,
    items: items.filter((i) => i.subject === subject),
  }));

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ subject: '语文', name: '', points: 1 });
    setShowModal(true);
  };

  const openEditModal = (item: ScoreItem) => {
    setEditingItem(item);
    setFormData({ subject: item.subject, name: item.name, points: item.points });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('请输入积分项名称', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const url = editingItem ? `/api/score-items/${editingItem.id}` : '/api/score-items';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem 
        ? { ...formData, id: editingItem.id }
        : formData;
      
      const res = await fetch(url, {
        method,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingItem ? '修改成功' : '添加成功', 'success');
        setShowModal(false);
        onRefresh();
      } else {
        showToast(data.message || '操作失败', 'error');
      }
    } catch {
      showToast('操作失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/score-items/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('删除成功', 'success');
        setDeleteConfirm(null);
        onRefresh();
      } else {
        showToast(data.message || '删除失败', 'error');
      }
    } catch {
      showToast('删除失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">积分项管理</h2>
        <button onClick={openAddModal} className="btn btn-primary">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加积分项
        </button>
      </div>

      {groupedItems.map(({ subject, items: subjectItems }) => (
        <div key={subject} className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className={`badge ${
              subject === '语文' ? 'badge-primary' : 
              subject === '数学' ? 'badge-success' : 'badge-warning'
            }`}>
              {subject}
            </span>
            <span className="text-gray-500 text-sm">({subjectItems.length}项)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">积分项名称</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">分值</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjectItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2">
                      <span className="badge badge-success">+{item.points}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => openEditModal(item)}
                        className="btn btn-sm btn-outline mr-2"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="btn btn-sm btn-danger"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">
              {editingItem ? '编辑积分项' : '添加积分项'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value as typeof formData.subject })}
                  className="select-control"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">积分项名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-control"
                  placeholder="例如：课后全对"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分值</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="input-control"
                  min="1"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline flex-1">
                  取消
                </button>
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                  {submitting ? '处理中...' : '确认'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="确认删除"
        message="确定要删除这个积分项吗？此操作不可撤销。"
        confirmText="删除"
        confirmVariant="danger"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        loading={submitting}
      />
    </div>
  );
}

function ScoreEntryTab({ 
  students, 
  items, 
  onRefresh, 
  showToast 
}: { 
  students: Student[]; 
  items: ScoreItem[]; 
  onRefresh: () => void; 
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState<'语文' | '数学' | '英语'>('语文');
  const [selectedItem, setSelectedItem] = useState('');
  const [week, setWeek] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const subjects = ['语文', '数学', '英语'] as const;
  const filteredItems = items.filter((i) => i.subject === selectedSubject);

  useEffect(() => {
    if (filteredItems.length > 0 && !filteredItems.find((i) => i.id === selectedItem)) {
      setSelectedItem(filteredItems[0].id);
    }
  }, [selectedSubject, filteredItems, selectedItem]);

  const selectedItemData = items.find((i) => i.id === selectedItem);
  const selectedStudentData = students.find((s) => s.id === selectedStudent);

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedItem) {
      showToast('请选择学生和积分项', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/score-records', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent,
          itemId: selectedItem,
          week,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setShowConfirm(false);
        onRefresh();
      } else {
        showToast(data.message || '录入失败', 'error');
      }
    } catch {
      showToast('录入失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card max-w-lg">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </span>
        录入积分
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">选择学生</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="select-control"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}（当前积分：{s.totalPoints}）</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">选择科目</label>
          <div className="tab-container">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`tab-item ${selectedSubject === s ? 'tab-item-active' : 'tab-item-inactive'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">选择积分项</label>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="select-control"
          >
            {filteredItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} (+{item.points}分)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <input
            type="date"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            className="input-control"
          />
        </div>

        {selectedItemData && selectedStudentData && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <h4 className="font-medium text-gray-700 mb-2">录入预览</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{selectedStudentData.name}</span> 
                  <span className="mx-2">·</span>
                  <span className="text-blue-600">{selectedSubject}</span>
                </p>
                <p className="text-sm text-gray-600">{selectedItemData.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">+{selectedItemData.points}</p>
                <p className="text-xs text-gray-500">积分</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowConfirm(true)}
          className="btn btn-success w-full"
          disabled={!selectedStudent || !selectedItem}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          确认录入
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="确认录入积分"
        message={`确定为 ${selectedStudentData?.name} 录入「${selectedItemData?.name}」+${selectedItemData?.points} 分？`}
        confirmText="确认录入"
        confirmVariant="primary"
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirm(false)}
        loading={submitting}
      />
    </div>
  );
}

function ExchangeTab({ 
  students, 
  onRefresh, 
  showToast 
}: { 
  students: Student[]; 
  onRefresh: () => void; 
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [newRate, setNewRate] = useState('');

  const selectedStudentData = students.find((s) => s.id === selectedStudent);

  const handleExchange = async () => {
    const pointsNum = parseInt(points);
    if (!pointsNum || pointsNum <= 0) {
      showToast('请输入有效的兑换积分', 'error');
      return;
    }
    if (!reason.trim()) {
      showToast('请输入兑换原因', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/exchange', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent,
          points: pointsNum,
          reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setShowConfirm(false);
        setPoints('');
        setReason('');
        onRefresh();
      } else {
        showToast(data.message, 'error');
        if (data.details) {
          setTimeout(() => showToast(data.details, 'error'), 500);
        }
      }
    } catch {
      showToast('兑换失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRate = async (studentId: string) => {
    const rateNum = parseInt(newRate);
    if (!rateNum || rateNum < 10 || rateNum > 100) {
      showToast('比例必须在10-100之间', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${studentId}/rate`, {
        method: 'PUT',
        body: JSON.stringify({ rate: rateNum }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('兑换比例修改成功', 'success');
        setEditingRate(null);
        onRefresh();
      } else {
        showToast(data.message || '修改失败', 'error');
      }
    } catch {
      showToast('修改失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.map((s) => (
          <div key={s.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg">{s.name}</h3>
              <span className="badge badge-primary">{s.totalPoints} 积分</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['语文', '数学', '英语'] as const).map((subject) => (
                <div key={subject} className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">{subject}</div>
                  <div className="font-bold text-sm">{s.subjectPoints[subject]}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">兑换比例限制</span>
              {editingRate === s.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="input-control w-20 py-1 text-sm"
                    min="10"
                    max="100"
                  />
                  <span>%</span>
                  <button
                    onClick={() => handleUpdateRate(s.id)}
                    className="btn btn-sm btn-primary"
                    disabled={submitting}
                  >
                    保存
                  </button>
                  <button onClick={() => setEditingRate(null)} className="btn btn-sm btn-outline">
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingRate(s.id);
                    setNewRate(s.exchangeRate.toString());
                  }}
                  className="text-blue-600 hover:underline"
                >
                  每科不超过 {s.exchangeRate}%
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card max-w-lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </span>
          积分兑换
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择学生</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="select-control"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}（可用积分：{s.totalPoints}）
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">兑换积分</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="input-control"
              placeholder="请输入兑换积分数"
              min="1"
              max={selectedStudentData?.totalPoints || 0}
            />
            {selectedStudentData && (
              <p className="text-xs text-gray-500 mt-1">
                可用积分：{selectedStudentData.totalPoints}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">兑换原因</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-control"
              placeholder="例如：兑换玩具、零食等"
            />
          </div>

          {selectedStudentData && parseInt(points) >= 100 && (
            <div className="alert alert-warning">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium">大额兑换提醒</p>
                <p className="text-xs">兑换≥100分需要平衡发展，每科积分占比需≥{selectedStudentData.exchangeRate}%</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowConfirm(true)}
            className="btn btn-warning w-full"
            disabled={!selectedStudent || !points || !reason}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            确认兑换
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="确认积分兑换"
        message={`确定为 ${selectedStudentData?.name} 兑换 ${points} 积分？原因：${reason}`}
        confirmText="确认兑换"
        confirmVariant="danger"
        onConfirm={handleExchange}
        onCancel={() => setShowConfirm(false)}
        loading={submitting}
      />
    </div>
  );
}

function RecordsTab({
  students,
  items,
  scoreRecords,
  exchangeRecords,
  onRefresh,
  showToast,
}: {
  students: Student[];
  items: ScoreItem[];
  scoreRecords: ScoreRecord[];
  exchangeRecords: ExchangeRecord[];
  onRefresh: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [activeSubTab, setActiveSubTab] = useState<'score' | 'exchange'>('score');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'score' | 'exchange'; id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      const url = deleteConfirm.type === 'score' 
        ? `/api/score-records/${deleteConfirm.id}`
        : `/api/exchange-records/${deleteConfirm.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setDeleteConfirm(null);
        onRefresh();
      } else {
        showToast(data.message || '删除失败', 'error');
      }
    } catch {
      showToast('删除失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const sortedScoreRecords = [...scoreRecords].sort((a, b) => 
    new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  );
  const sortedExchangeRecords = [...exchangeRecords].sort((a, b) => 
    new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="tab-container">
        <button
          onClick={() => setActiveSubTab('score')}
          className={`tab-item ${activeSubTab === 'score' ? 'tab-item-active' : 'tab-item-inactive'}`}
        >
          积分记录 ({scoreRecords.length})
        </button>
        <button
          onClick={() => setActiveSubTab('exchange')}
          className={`tab-item ${activeSubTab === 'exchange' ? 'tab-item-active' : 'tab-item-inactive'}`}
        >
          兑换记录 ({exchangeRecords.length})
        </button>
      </div>

      {activeSubTab === 'score' && (
        <div className="card">
          <h3 className="font-semibold mb-3">积分录入记录</h3>
          {sortedScoreRecords.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>暂无积分记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">时间</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">学生</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">积分项</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">积分</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedScoreRecords.slice(0, 20).map((record) => {
                    const student = students.find((s) => s.id === record.studentId);
                    const item = items.find((i) => i.id === record.itemId);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600 text-xs">{record.createTime}</td>
                        <td className="px-3 py-2 font-medium">{student?.name || '未知'}</td>
                        <td className="px-3 py-2">
                          <span className="badge badge-primary mr-1">{item?.subject}</span>
                          {item?.name}
                        </td>
                        <td className="px-3 py-2 text-green-600 font-bold">+{record.points}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => setDeleteConfirm({ type: 'score', id: record.id })}
                            className="btn btn-sm btn-danger"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {sortedScoreRecords.length > 20 && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  仅显示最近20条记录
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'exchange' && (
        <div className="card">
          <h3 className="font-semibold mb-3">积分兑换记录</h3>
          {sortedExchangeRecords.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <p>暂无兑换记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">时间</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">学生</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">兑换积分</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">原因</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedExchangeRecords.slice(0, 20).map((record) => {
                    const student = students.find((s) => s.id === record.studentId);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600 text-xs">{record.createTime}</td>
                        <td className="px-3 py-2 font-medium">{student?.name || '未知'}</td>
                        <td className="px-3 py-2 text-red-600 font-bold">-{record.points}</td>
                        <td className="px-3 py-2 text-gray-600">{record.reason}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => setDeleteConfirm({ type: 'exchange', id: record.id })}
                            className="btn btn-sm btn-danger"
                          >
                            撤销
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {sortedExchangeRecords.length > 20 && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  仅显示最近20条记录
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title={deleteConfirm?.type === 'score' ? '删除积分记录' : '撤销兑换记录'}
        message={deleteConfirm?.type === 'score' 
          ? '确定要删除这条积分记录吗？积分将从学生总分中扣除。' 
          : '确定要撤销这条兑换记录吗？积分将返还给学生。'
        }
        confirmText={deleteConfirm?.type === 'score' ? '删除' : '撤销'}
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        loading={submitting}
      />
    </div>
  );
}
