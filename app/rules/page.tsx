export default function Rules() {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">📜 积分规则说明</h1>
        <h3 className="font-bold mt-3">✅ 积分积累规则</h3>
        <p>语文/数学/英语：课后全对+1 | 作业全对+3 | 听写默写+7 | 练习册+30 | 周末题单+30 | 单元考+100 | 期中+500 | 期末+1000</p>
        <h3 className="font-bold mt-3">✅ 积分兑换规则</h3>
        <p>1. 总积分＜100：无限制兑换</p>
        <p>2. 总积分≥100：必须平衡发展</p>
        <p>🧒 陈姝淼：每科最多兑换总积分的40%</p>
        <p>👦 陈书辰：每科最多兑换总积分的50%</p>
      </div>
    );
  }