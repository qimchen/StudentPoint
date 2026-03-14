export default function Rules() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">📜 积分规则说明</h1>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>✅ 积分积累规则</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
            加分项
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <h3 className="font-bold text-blue-600 mb-2">语文</h3>
            <ul className="space-y-1 text-sm">
              <li>• 课后全对 +1 分</li>
              <li>• 作业全对 +3 分</li>
              <li>• 听写默写 +7 分</li>
              <li>• 练习册 +30 分</li>
              <li>• 周末题单 +30 分</li>
              <li>• 单元考 +100 分</li>
              <li>• 期中 +500 分</li>
              <li>• 期末 +1000 分</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <h3 className="font-bold text-green-600 mb-2">数学</h3>
            <ul className="space-y-1 text-sm">
              <li>• 课后全对 +1 分</li>
              <li>• 作业全对 +3 分</li>
              <li>• 听写默写 +7 分</li>
              <li>• 练习册 +30 分</li>
              <li>• 周末题单 +30 分</li>
              <li>• 单元考 +100 分</li>
              <li>• 期中 +500 分</li>
              <li>• 期末 +1000 分</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <h3 className="font-bold text-amber-600 mb-2">英语</h3>
            <ul className="space-y-1 text-sm">
              <li>• 课后全对 +1 分</li>
              <li>• 作业全对 +3 分</li>
              <li>• 听写默写 +7 分</li>
              <li>• 练习册 +30 分</li>
              <li>• 周末题单 +30 分</li>
              <li>• 单元考 +100 分</li>
              <li>• 期中 +500 分</li>
              <li>• 期末 +1000 分</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>💱 积分兑换规则</span>
          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
            兑换限制
          </span>
        </h2>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-2 text-gray-800">基础规则</h3>
            <p className="text-sm">1. 总积分＜100：无限制兑换</p>
            <p className="text-sm">2. 总积分≥100：必须平衡发展</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-pink-50 rounded-lg p-3 border border-pink-100">
              <h3 className="font-bold text-pink-600 mb-2">🧒 陈姝淼</h3>
              <p className="text-sm">每科最多兑换总积分的 40%</p>
            </div>
            
            <div className="bg-sky-50 rounded-lg p-3 border border-sky-100">
              <h3 className="font-bold text-sky-600 mb-2">👦 陈书辰</h3>
              <p className="text-sm">每科最多兑换总积分的 50%</p>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            <p className="font-medium mb-1">📝 规则说明</p>
            <p>• 兑换积分将从总积分中扣除</p>
            <p>• 兑换比例可在管理后台调整</p>
            <p>• 兑换记录会永久保存，可在首页查看</p>
          </div>
        </div>
      </div>
    </div>
  );
}