export default function Rules() {
  const scoreItems = [
    { name: '课后全对', points: 1, icon: '✏️', colorClass: 'text-blue-600' },
    { name: '抄写作业、课堂作业全对', points: 3, icon: '📝', colorClass: 'text-green-600' },
    { name: '听写、默写全对', points: 7, icon: '📖', colorClass: 'text-amber-600' },
    { name: '练习册全对', points: 30, icon: '📚', colorClass: 'text-purple-600' },
    { name: '周末题单（特色作业）全对', points: 30, icon: '⭐', colorClass: 'text-pink-600' },
    { name: '单元考满分', points: 100, icon: '🏆', colorClass: 'text-indigo-600' },
    { name: '期中考满分', points: 500, icon: '🎖️', colorClass: 'text-orange-600' },
    { name: '期末考满分', points: 1000, icon: '👑', colorClass: 'text-red-600' },
  ];

  const subjects = [
    { name: '语文', icon: '📖', gradientClass: 'from-blue-400 to-blue-600', bgClass: 'bg-blue-50', borderClass: 'border-blue-200' },
    { name: '数学', icon: '🔢', gradientClass: 'from-green-400 to-green-600', bgClass: 'bg-green-50', borderClass: 'border-green-200' },
    { name: '英语', icon: '🔤', gradientClass: 'from-amber-400 to-amber-600', bgClass: 'bg-amber-50', borderClass: 'border-amber-200' },
  ];

  const students = [
    { name: '陈姝淼', rate: 40, avatar: '👧', bgClass: 'bg-pink-50', borderClass: 'border-pink-200', gradientClass: 'from-pink-400 to-pink-600', textClass: 'text-pink-600' },
    { name: '陈书辰', rate: 50, avatar: '👦', bgClass: 'bg-blue-50', borderClass: 'border-blue-200', gradientClass: 'from-blue-400 to-blue-600', textClass: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">积分规则说明</h1>
          <p className="text-sm text-gray-500 mt-1">了解积分获取与兑换规则</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">积分积累规则</h2>
            <p className="text-sm text-gray-500">通过学习表现获取积分</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {subjects.map((subject) => (
            <div key={subject.name} className={`${subject.bgClass} rounded-xl p-4 border ${subject.borderClass}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${subject.gradientClass} rounded-lg flex items-center justify-center text-white text-lg`}>
                  {subject.icon}
                </div>
                <h3 className="font-bold text-lg">{subject.name}</h3>
              </div>
              <ul className="space-y-2">
                {scoreItems.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm bg-white/60 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-gray-700">{item.name}</span>
                    </span>
                    <span className={`font-bold ${item.colorClass}`}>+{item.points}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">积分说明</p>
              <p className="text-xs text-gray-500 mt-1">以上积分项适用于语文、数学、英语三个科目，管理员可在后台自定义添加或修改积分项。</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">积分兑换规则</h2>
            <p className="text-sm text-gray-500">积分可兑换奖励</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              基础规则
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium text-sm">总积分 &lt; 100</span>
                </div>
                <p className="text-xs text-gray-500 ml-6">无限制兑换</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-medium text-sm">总积分 ≥ 100</span>
                </div>
                <p className="text-xs text-gray-500 ml-6">需要平衡发展</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <div key={student.name} className={`${student.bgClass} rounded-xl p-4 border ${student.borderClass}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${student.gradientClass} rounded-xl flex items-center justify-center`}>
                    <span className="text-2xl">{student.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <p className="text-xs text-gray-500">兑换比例限制</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">每科最多兑换</span>
                    <span className={`font-bold ${student.textClass}`}>{student.rate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-bar-fill bg-gradient-to-r ${student.gradientClass}`}
                      style={{ width: `${student.rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">平衡发展说明</p>
                <p className="text-xs text-gray-500 mt-1">
                  当兑换积分≥100时，需要确保各科目积分均衡发展。例如陈姝淼每科积分占比需≥40%，陈书辰需≥50%。
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  这样可以鼓励小朋友全面发展，不偏科。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">其他说明</h2>
            <p className="text-sm text-gray-500">使用须知</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">积分永久有效</h3>
            <p className="text-xs text-gray-500">积分不会过期，可累积使用</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">兑换灵活</h3>
            <p className="text-xs text-gray-500">可随时兑换，无最低限制</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">比例可调</h3>
            <p className="text-xs text-gray-500">管理员可调整兑换比例</p>
          </div>
        </div>
      </div>
    </div>
  );
}
