export default function WelcomeCard() {
  return (
    <div className="smart-card animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
          style={{ background: "var(--primary)" }}
        >
          A
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">欢迎使用 Artic 工作台</h2>
          <p className="text-sm text-muted mt-0.5">一站式运营管理 · 智能技能驱动</p>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "竞品追踪", desc: "实时监控竞品动态", color: "#6366F1" },
          { label: "活动管理", desc: "策划与执行跟踪", color: "#8B5CF6" },
          { label: "数据分析", desc: "漏斗·留存·转化", color: "#06B6D4" },
          { label: "版本管理", desc: "发布清单与回滚", color: "#10B981" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border p-4 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: item.color }}
              />
              <span className="text-sm font-semibold text-gray-800">{item.label}</span>
            </div>
            <p className="text-xs text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* 统计条 */}
      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <div>
          <span className="text-2xl font-bold" style={{ color: "var(--primary)" }}>76</span>
          <span className="text-xs text-muted ml-1">内置技能</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div>
          <span className="text-2xl font-bold text-gray-800">9</span>
          <span className="text-xs text-muted ml-1">功能模块</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div>
          <span className="text-2xl font-bold text-gray-800">20</span>
          <span className="text-xs text-muted ml-1">智能行为</span>
        </div>
      </div>
    </div>
  );
}
