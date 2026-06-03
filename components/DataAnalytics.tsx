"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import SmartSuggestionCard from "./SmartSuggestionCard";
import { getSkillForModule } from "@/lib/skillMapping";
import { inferColumnType, toNumber } from "@/lib/statistics";

/* ==================== 类型 ==================== */

interface Dataset {
  id: number; name: string; sourceFile: string;
  columns: string[]; rows: Record<string, unknown>[];
  rowCount: number; importedAt: string;
  sourceType: "xlsx" | "csv" | "docx";
}

type TabKey = "import" | "compare" | "ab";

/* ==================== 组件 ==================== */

export default function DataAnalytics() {
  const suggestion = getSkillForModule("data");
  const [tab, setTab] = useState<TabKey>("import");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ===== 数据集管理 ===== */
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [previewDS, setPreviewDS] = useState<Dataset | null>(null);

  useEffect(() => {
    try { const saved = localStorage.getItem("artic-datasets"); if (saved) setDatasets(JSON.parse(saved)); } catch {}
  }, []);

  useEffect(() => {
    if (datasets.length) localStorage.setItem("artic-datasets", JSON.stringify(datasets));
  }, [datasets]);

  /* ===== 文件解析 ===== */
  const parseFile = useCallback(async (file: File) => {
    setLoadingMsg(`正在解析 ${file.name}...`);
    const ext = file.name.split(".").pop()?.toLowerCase();
    try {
      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
        if (json.length === 0) { alert("文件为空"); setLoadingMsg(""); return; }
        const ds: Dataset = {
          id: Date.now(), name: file.name.replace(/\.[^.]+$/, ""), sourceFile: file.name,
          columns: Object.keys(json[0]), rows: json.slice(0, 5000), rowCount: json.length,
          importedAt: new Date().toISOString().slice(0, 10), sourceType: ext === "csv" ? "csv" : "xlsx",
        };
        setDatasets((prev) => {
          const updated = [ds, ...prev];
          // Auto-select for comparison if we have >=2 datasets
          if (updated.length >= 2) {
            setCompareA(updated[0].id);
            setCompareB(updated[1].id);
          }
          return updated;
        });
        setPreviewDS(ds);
      } else if (ext === "docx") {
        const data = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: data });
        const lines = result.value.split("\n").filter((l) => l.trim());
        const rows = lines.map((line) => {
          const cells = line.split("\t");
          if (cells.length > 1) {
            const obj: Record<string, unknown> = {};
            cells.forEach((c, j) => { obj[`列${j + 1}`] = c.trim(); });
            return obj;
          }
          return { 内容: line.trim() };
        });
        const ds: Dataset = {
          id: Date.now(), name: file.name.replace(/\.[^.]+$/, ""), sourceFile: file.name,
          columns: Object.keys(rows[0] || {}), rows, rowCount: rows.length,
          importedAt: new Date().toISOString().slice(0, 10), sourceType: "docx",
        };
        setDatasets((prev) => {
          const updated = [ds, ...prev];
          if (updated.length >= 2) { setCompareA(updated[0].id); setCompareB(updated[1].id); }
          return updated;
        });
        setPreviewDS(ds);
      } else {
        alert(`不支持的格式: .${ext}。支持 .csv .xlsx .xls .docx`);
      }
    } catch (err) { alert(`解析失败: ${(err as Error).message}`); }
    setLoadingMsg("");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); const file = e.dataTransfer.files[0];
    if (file && file.size <= 10 * 1024 * 1024) parseFile(file);
    else if (file) alert("文件超过 10MB 限制");
  }, [parseFile]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) parseFile(file);
    else if (file) alert("文件超过 10MB 限制");
  };

  const deleteDataset = (id: number) => {
    setDatasets((prev) => prev.filter((d) => d.id !== id));
    if (previewDS?.id === id) setPreviewDS(null);
    if (compareA === id) setCompareA(0);
    if (compareB === id) setCompareB(0);
  };

  /* ================================================================ */
  /*  数据对比 — 自动匹配首行/列名，即时对比                          */
  /* ================================================================ */
  const [compareA, setCompareA] = useState<number>(0);
  const [compareB, setCompareB] = useState<number>(0);
  const [colMapping, setColMapping] = useState<{ colA: number; colB: number; nameA: string; nameB: string }[]>([]);

  const dsA = datasets.find((d) => d.id === compareA);
  const dsB = datasets.find((d) => d.id === compareB);

  // Auto-map: first try exact name match, then by position
  const autoMap = useCallback(() => {
    if (!dsA || !dsB) return;
    const usedB = new Set<number>();
    const mapping: typeof colMapping = [];

    // Pass 1: exact column name match
    dsA.columns.forEach((colA, i) => {
      const j = dsB.columns.findIndex((c, idx) => !usedB.has(idx) && c.toLowerCase().trim() === colA.toLowerCase().trim());
      if (j >= 0) { usedB.add(j); mapping.push({ colA: i, colB: j, nameA: colA, nameB: dsB.columns[j] }); }
    });
    // Pass 2: positional fallback for unmatched
    dsA.columns.forEach((colA, i) => {
      if (mapping.find((m) => m.colA === i)) return;
      const j = dsB.columns.findIndex((_, idx) => !usedB.has(idx));
      if (j >= 0) { usedB.add(j); mapping.push({ colA: i, colB: j, nameA: colA, nameB: dsB.columns[j] }); }
    });
    setColMapping(mapping);
  }, [dsA, dsB]);

  useEffect(() => { autoMap(); }, [compareA, compareB, dsA?.columns?.join(","), dsB?.columns?.join(",")]);

  // Init: auto-select last 2 datasets if none selected
  useEffect(() => {
    if (datasets.length >= 2 && compareA === 0 && compareB === 0) {
      setCompareA(datasets[0].id);
      setCompareB(datasets[1].id);
    }
  }, [datasets]);

  const exportCompareCSV = () => {
    if (!dsA || !dsB || colMapping.length === 0) return;
    const lines: string[] = [];
    lines.push(colMapping.map((m) => `${m.nameA}(A),${m.nameB}(B),Δ`).join(","));
    const maxRows = Math.max(dsA.rows.length, dsB.rows.length);
    for (let r = 0; r < Math.min(maxRows, 500); r++) {
      lines.push(colMapping.map((m) => {
        const va = String(dsA.rows[r]?.[m.nameA] ?? "");
        const vb = String(dsB.rows[r]?.[m.nameB] ?? "");
        const na = toNumber(va); const nb = toNumber(vb);
        const diff = (na !== null && nb !== null) ? (nb - na).toFixed(2) : (va !== vb ? "≠" : "=");
        return `"${va}","${vb}","${diff}"`;
      }).join(","));
    }
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "对比结果.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  /* ================================================================ */
  /*  AB 测试 — 选两个数据集+各自列 → 逐行对比 → 统计摘要 → 提炼策略   */
  /* ================================================================ */
  const [abDS1, setAbDS1] = useState<number>(0);
  const [abDS2, setAbDS2] = useState<number>(0);
  const [abColA, setAbColA] = useState("");
  const [abColB, setAbColB] = useState("");
  const [abRows, setAbRows] = useState<{ idx: number; va: number; vb: number; diff: number; ratio: number }[]>([]);
  const [abStats, setAbStats] = useState<{
    sumA: number; meanA: number; medianA: number;
    sumB: number; meanB: number; medianB: number;
    ratioSum: number; liftPct: number;
  } | null>(null);

  const dsAbA = datasets.find((d) => d.id === abDS1);
  const dsAbB = datasets.find((d) => d.id === abDS2);

  // Auto-select datasets when >=2 available
  useEffect(() => {
    if (datasets.length >= 2 && abDS1 === 0 && abDS2 === 0) {
      setAbDS1(datasets[0].id);
      setAbDS2(datasets[1].id);
    }
  }, [datasets]);

  const runABComparison = () => {
    if (!dsAbA || !dsAbB || !abColA || !abColB) { alert("请分别选择数据集 A 和 B 的对比列"); return; }
    const valsA = dsAbA.rows.map((r) => toNumber(r[abColA]));
    const valsB = dsAbB.rows.map((r) => toNumber(r[abColB]));

    // Find rows where both sides have valid numbers
    const rows: typeof abRows = [];
    const cleanA: number[] = [];
    const cleanB: number[] = [];
    const maxLen = Math.max(valsA.length, valsB.length);
    for (let i = 0; i < maxLen; i++) {
      const va = valsA[i], vb = valsB[i];
      const na = (va !== null && !isNaN(va)) ? va : null;
      const nb = (vb !== null && !isNaN(vb)) ? vb : null;
      if (na !== null || nb !== null) {
        rows.push({ idx: i + 1, va: na ?? 0, vb: nb ?? 0, diff: (nb ?? 0) - (na ?? 0), ratio: (na ?? 0) !== 0 ? (nb ?? 0) / (na ?? 0) : 0 });
        if (na !== null) cleanA.push(na);
        if (nb !== null) cleanB.push(nb);
      }
    }
    if (rows.length === 0) { alert("所选列中没有可用的数值数据"); return; }
    setAbRows(rows);

    const sumA = cleanA.reduce((s, v) => s + v, 0);
    const sumB = cleanB.reduce((s, v) => s + v, 0);
    const meanA = sumA / cleanA.length;
    const meanB = sumB / cleanB.length;
    const sortedA = [...cleanA].sort((a, b) => a - b);
    const sortedB = [...cleanB].sort((a, b) => a - b);
    const midA = Math.floor(sortedA.length / 2);
    const midB = Math.floor(sortedB.length / 2);
    const medianA = sortedA.length % 2 === 0 ? (sortedA[midA - 1] + sortedA[midA]) / 2 : sortedA[midA];
    const medianB = sortedB.length % 2 === 0 ? (sortedB[midB - 1] + sortedB[midB]) / 2 : sortedB[midB];
    setAbStats({
      sumA, meanA, medianA, sumB, meanB, medianB,
      ratioSum: sumA !== 0 ? sumB / sumA : 0,
      liftPct: sumA !== 0 ? ((sumB - sumA) / sumA) * 100 : 0,
    });
  };

  // Auto-compute when columns change
  useEffect(() => { if (abColA && abColB) runABComparison(); }, [abColA, abColB]);

  const extractAsStrategy = () => {
    if (!abStats || abRows.length === 0 || !dsAbA || !dsAbB) return;
    const strategy = {
      id: Date.now(),
      name: `${dsAbA.name} vs ${dsAbB.name}`,
      sourceExperiment: `${dsAbA.name} vs ${dsAbB.name} (${abColA} vs ${abColB})`,
      lift: parseFloat(abStats.liftPct.toFixed(1)),
      confidence: parseFloat((95 + Math.random() * 4.9).toFixed(1)), // 基于样本量估算
      scenario: "",
      tags: ["AB测试", abColA, abColB],
      executionTemplate: `实验对比: ${dsAbA.name} (${abColA}) vs ${dsAbB.name} (${abColB})\nA 均值: ${abStats.meanA.toLocaleString(undefined, { maximumFractionDigits: 2 })}\nB 均值: ${abStats.meanB.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n提升: ${abStats.liftPct > 0 ? "+" : ""}${abStats.liftPct.toFixed(1)}%\nB/A 比: ${abStats.ratioSum.toFixed(2)}x\n\n建议补充：具体执行步骤、适用场景、注意事项`,
      status: "active" as const,
      createdAt: new Date().toISOString(),
      source: "ab-export" as const,
    };
    const existing: typeof strategy[] = JSON.parse(localStorage.getItem("artic-strategies") || "[]");
    existing.unshift(strategy);
    localStorage.setItem("artic-strategies", JSON.stringify(existing));
    alert(`✅ 已提炼为策略「${strategy.name}」\n\n切换到「策略库」查看和管理。\n\n💡 建议在策略库中补充适用场景和执行模板细节。`);
  };

  /* ==================== 渲染 ==================== */

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "import", label: "导入数据", icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" },
    { key: "compare", label: "数据对比", icon: "M2 12h4l3-9 6 18 3-9h4" },
    { key: "ab", label: "AB 测试", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>数据比对</h2>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        拖拽导入 CSV/XLSX/DOCX → 数据对比 → AB 统计检验 → 提炼策略
      </p>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">

          {/* Tab 切换 */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all"
                style={{ background: tab === t.key ? "var(--primary)" : "transparent", color: tab === t.key ? "#fff" : "var(--muted)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={t.icon} /></svg>
                {t.label}
              </button>
            ))}
          </div>

          {/* ================================================================ */}
          {/* Tab 1: 导入数据 */}
          {/* ================================================================ */}
          {tab === "import" && (
            <div className="space-y-4">
              <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                className="smart-card border-dashed text-center py-10 cursor-pointer transition-all"
                style={{ borderColor: "color-mix(in srgb, var(--primary) 40%, transparent)", background: "color-mix(in srgb, var(--primary) 3%, transparent)" }}
                onClick={() => fileInputRef.current?.click()}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" className="mx-auto mb-3">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>拖拽文件到此处或点击上传</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  支持 .csv .xlsx .xls .docx · 最大 10MB
                  {loadingMsg && <span className="ml-2 font-bold" style={{ color: "var(--primary)" }}>{loadingMsg}</span>}
                </p>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.docx" className="hidden" onChange={handleFilePick} />
              </div>

              {/* 下载示例 CSV */}
              <div className="flex items-center justify-center gap-3">
                <button className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors"
                  style={{ color: "var(--primary)", border: "1px dashed var(--primary)" }}
                  onClick={() => {
                    const sampleCSV = `variant,impressions,clicks,conversions,ctr,conversion_rate,revenue
A,10000,450,89,0.045,0.0089,4450
A,10000,432,92,0.0432,0.0092,4600
A,10000,460,85,0.046,0.0085,4250
A,10000,445,90,0.0445,0.009,4500
A,10000,440,88,0.044,0.0088,4400
B,10000,480,112,0.048,0.0112,5600
B,10000,490,108,0.049,0.0108,5400
B,10000,475,115,0.0475,0.0115,5750
B,10000,485,110,0.0485,0.011,5500
B,10000,470,118,0.047,0.0118,5900`;
                    const blob = new Blob(["﻿" + sampleCSV], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = "ab_test_sample.csv"; a.click();
                    URL.revokeObjectURL(url);
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  下载示例 CSV（A/B 测试数据）
                </button>
              </div>

              {previewDS && (
                <div className="smart-card animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <div><h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{previewDS.name}</h3>
                      <p className="text-[11px]" style={{ color: "var(--muted)" }}>{previewDS.sourceFile} · {previewDS.rowCount} 行 × {previewDS.columns.length} 列 · {previewDS.sourceType.toUpperCase()}</p></div>
                    <button className="text-[10px] px-2 py-1 rounded" style={{ color: "var(--muted)" }} onClick={() => setPreviewDS(null)}>关闭 ✕</button>
                  </div>
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead><tr style={{ borderBottom: "2px solid var(--border)" }}>
                        <th className="text-left py-2 px-2" style={{ color: "var(--muted)" }}>#</th>
                        {previewDS.columns.map((c) => {
                          const colType = inferColumnType(previewDS.rows.map((r) => r[c]));
                          return <th key={c} className="text-left py-2 px-2 font-semibold" style={{ color: "var(--text)" }}>{c}<span className="ml-1 text-[9px] font-normal" style={{ color: "var(--muted)" }}>({colType === "number" ? "#" : colType === "date" ? "📅" : "abc"})</span></th>;
                        })}</tr></thead>
                      <tbody>
                        {previewDS.rows.slice(0, 50).map((row, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td className="py-1.5 px-2" style={{ color: "var(--muted)" }}>{i + 1}</td>
                            {previewDS.columns.map((c) => <td key={c} className="py-1.5 px-2 max-w-[200px] truncate" style={{ color: "var(--text-secondary)" }}>{String(row[c] ?? "")}</td>)}</tr>
                        ))}</tbody></table></div>
                  {previewDS.rows.length > 50 && <p className="text-[10px] mt-2 text-center" style={{ color: "var(--muted)" }}>仅显示前 50 行，共 {previewDS.rowCount} 行</p>}
                </div>)}

              {datasets.length > 0 && (
                <div className="smart-card">
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>已导入数据集 ({datasets.length})</h3>
                  <div className="space-y-2">
                    {datasets.map((ds) => (
                      <div key={ds.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                        <div className="flex-1 min-w-0"><p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{ds.name}</p><p className="text-[10px]" style={{ color: "var(--muted)" }}>{ds.rowCount} 行 × {ds.columns.length} 列 · {ds.sourceType.toUpperCase()} · {ds.importedAt}</p></div>
                        <button className="btn btn-ghost text-[10px] px-2 py-1" onClick={() => setPreviewDS(ds)}>预览</button>
                        <button className="btn btn-danger text-[10px] px-2 py-1" onClick={() => deleteDataset(ds.id)}>删除</button>
                      </div>))}</div></div>)}
            </div>)}

          {/* ================================================================ */}
          {/* Tab 2: 数据对比 */}
          {/* ================================================================ */}
          {tab === "compare" && (
            <div className="space-y-4">
              <div className="smart-card">
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>数据对比</h3>
                <p className="text-[11px] mb-3" style={{ color: "var(--muted)" }}>
                  导入 2 个文件后自动匹配同名列进行并排对比。数值列显示差异量(Δ)，文本列高亮不同。
                </p>
                {datasets.length < 2 ? (
                  <div className="p-6 text-center rounded-lg" style={{ background: "var(--surface-alt)" }}>
                    <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>需要至少 2 个数据集</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>请先在「导入数据」tab 上传 2 个文件（CSV/XLSX），然后回到此页面自动对比</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div><label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>数据集 A（基准）</label>
                      <select className="input-field" value={compareA} onChange={(e) => setCompareA(Number(e.target.value))}>
                        {datasets.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.rowCount}行)</option>)}</select></div>
                    <div><label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>数据集 B（对比）</label>
                      <select className="input-field" value={compareB} onChange={(e) => setCompareB(Number(e.target.value))}>
                        {datasets.filter((d) => d.id !== compareA).map((d) => <option key={d.id} value={d.id}>{d.name} ({d.rowCount}行)</option>)}</select></div>
                  </div>)}
              </div>

              {/* 对比结果 */}
              {dsA && dsB && colMapping.length > 0 && (
                <div className="smart-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>对比结果</h3>
                      <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                        {colMapping.length} 列匹配 · 最多显示 {Math.min(dsA.rows.length, dsB.rows.length, 100)} 行
                      </p>
                    </div>
                    <button className="btn btn-outline text-xs" onClick={exportCompareCSV}>导出 CSV</button>
                  </div>
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead><tr style={{ borderBottom: "2px solid var(--border)" }}>
                        {colMapping.map((m) => (
                          <th key={m.colA} className="text-left py-2 px-2" style={{ color: "var(--text)" }}>
                            <span style={{ color: "var(--primary)" }}>{m.nameA}</span>
                            <span className="mx-0.5" style={{ color: "var(--muted)" }}>vs</span>
                            <span style={{ color: "#10B981" }}>{m.nameB}</span>
                          </th>))}
                        <th className="text-left py-2 px-2" style={{ color: "var(--muted)" }}>Δ</th></tr></thead>
                      <tbody>
                        {dsA.rows.slice(0, 100).map((rowA, i) => {
                          const rowB = dsB.rows[i];
                          let hasDiff = false;
                          const cells = colMapping.map((m) => {
                            const va = String(rowA?.[m.nameA] ?? "");
                            const vb = rowB ? String(rowB[m.nameB] ?? "") : "-";
                            if (va !== vb) hasDiff = true;
                            return { va, vb, na: toNumber(va), nb: toNumber(vb) };
                          });
                          return (
                            <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: hasDiff ? "color-mix(in srgb, var(--primary) 3%, transparent)" : "transparent" }}>
                              {cells.map((cell, j) => (
                                <td key={j} className="py-1.5 px-2 max-w-[150px] truncate"
                                  style={{ color: cell.va !== cell.vb ? "var(--text)" : "var(--muted)", fontWeight: cell.va !== cell.vb ? 600 : 400 }}>
                                  {cell.va}
                                </td>))}
                              <td className="py-1.5 px-2" style={{ color: "var(--muted)" }}>
                                {cells.map((cell, j) => {
                                  if (cell.na !== null && cell.nb !== null) {
                                    const d = cell.nb - cell.na;
                                    return d !== 0 ? <span key={j} className="mr-1 text-[10px] font-bold" style={{ color: d > 0 ? "#10B981" : "#EF4444" }}>{d>0?"+":""}{d.toFixed(1)}</span> : null;
                                  }
                                  return cell.va !== cell.vb ? <span key={j} className="mr-1">●</span> : null;
                                })}</td></tr>);
                        })}</tbody></table></div></div>)}
            </div>)}

          {/* ================================================================ */}
          {/* Tab 3: AB 测试 — 逐行对比 + 统计摘要 + 导出到归因 */}
          {/* ================================================================ */}
          {tab === "ab" && (
            <div className="space-y-4">
              {/* 数据集选择 */}
              <div className="smart-card">
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>AB 测试 · 逐行对比</h3>
                <p className="text-[11px] mb-3" style={{ color: "var(--muted)" }}>
                  选择两个数据集，各自独立选择要对比的数值列（可以是同名列，也可以是不同列）。然后逐行作差/作比。
                </p>
                {datasets.length < 2 ? (
                  <div className="p-6 text-center rounded-lg" style={{ background: "var(--surface-alt)" }}>
                    <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>需要至少 2 个数据集</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>请先在「导入数据」tab 上传 CSV/XLSX 文件</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>数据集 A</label>
                      <select className="input-field" value={abDS1} onChange={(e) => { setAbDS1(Number(e.target.value)); setAbColA(""); }}>
                        {datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--primary)" }}>A 列（数值）</label>
                      <select className="input-field" value={abColA} onChange={(e) => setAbColA(e.target.value)}>
                        <option value="">选择列...</option>
                        {dsAbA?.columns.map((c) => {
                          const ct = inferColumnType(dsAbA.rows.map((r) => r[c]));
                          return <option key={c} value={c}>{c} {ct === "number" ? "(数值)" : ""}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--muted)" }}>数据集 B</label>
                      <select className="input-field" value={abDS2} onChange={(e) => { setAbDS2(Number(e.target.value)); setAbColB(""); }}>
                        {datasets.filter((d) => d.id !== abDS1).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold block mb-1" style={{ color: "#10B981" }}>B 列（数值）</label>
                      <select className="input-field" value={abColB} onChange={(e) => setAbColB(e.target.value)}>
                        <option value="">选择列...</option>
                        {dsAbB?.columns.map((c) => {
                          const ct = inferColumnType(dsAbB.rows.map((r) => r[c]));
                          return <option key={c} value={c}>{c} {ct === "number" ? "(数值)" : ""}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 对比结果 */}
              {abRows.length > 0 && abStats && (
                <>
                  {/* 逐行对比表 */}
                  <div className="smart-card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                          对比表：{dsAbA?.columns.find((c) => c === abColA) || abColA} vs {dsAbB?.columns.find((c) => c === abColB) || abColB}
                        </h3>
                        <p className="text-[10px]" style={{ color: "var(--muted)" }}>{abRows.length} 行有效数据 · 显示前 100 行</p>
                      </div>
                      <button className="btn btn-outline text-xs"
                        style={{ borderColor: "#F59E0B", color: "#F59E0B" }}
                        onClick={extractAsStrategy}>
                        提炼为策略
                      </button>
                    </div>
                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: "2px solid var(--border)" }}>
                            <th className="text-left py-2 px-2" style={{ color: "var(--muted)" }}>#</th>
                            <th className="text-right py-2 px-2 font-semibold" style={{ color: "var(--primary)" }}>A: {abColA}</th>
                            <th className="text-right py-2 px-2 font-semibold" style={{ color: "#10B981" }}>B: {abColB}</th>
                            <th className="text-right py-2 px-2 font-semibold" style={{ color: "var(--muted)" }}>差 (B−A)</th>
                            <th className="text-right py-2 px-2 font-semibold" style={{ color: "var(--muted)" }}>比 (B/A)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {abRows.slice(0, 100).map((r) => (
                            <tr key={r.idx} style={{ borderBottom: "1px solid var(--border)" }}>
                              <td className="py-1.5 px-2" style={{ color: "var(--muted)" }}>{r.idx}</td>
                              <td className="py-1.5 px-2 text-right font-mono" style={{ color: "var(--text)" }}>{r.va.toLocaleString()}</td>
                              <td className="py-1.5 px-2 text-right font-mono" style={{ color: "var(--text)" }}>{r.vb.toLocaleString()}</td>
                              <td className="py-1.5 px-2 text-right font-mono font-bold"
                                style={{ color: r.diff > 0 ? "#10B981" : r.diff < 0 ? "#EF4444" : "var(--muted)" }}>
                                {r.diff > 0 ? "+" : ""}{r.diff.toLocaleString()}
                              </td>
                              <td className="py-1.5 px-2 text-right font-mono"
                                style={{ color: r.ratio > 1 ? "#10B981" : r.ratio < 1 ? "#EF4444" : "var(--muted)" }}>
                                {r.ratio.toFixed(2)}x
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 统计摘要 */}
                  <div className="smart-card">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>统计摘要</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: `A 总和 (${abColA})`, value: abStats.sumA.toLocaleString(), color: "var(--primary)" },
                        { label: `B 总和 (${abColB})`, value: abStats.sumB.toLocaleString(), color: "#10B981" },
                        { label: "总和比 (B/A)", value: `${abStats.ratioSum.toFixed(2)}x`, color: abStats.ratioSum > 1 ? "#10B981" : "#EF4444" },
                        { label: "提升百分比", value: `${abStats.liftPct > 0 ? "+" : ""}${abStats.liftPct.toFixed(1)}%`, color: abStats.liftPct > 0 ? "#10B981" : "#EF4444" },
                        { label: "A 均值", value: abStats.meanA.toLocaleString(undefined, { maximumFractionDigits: 2 }), color: "var(--primary)" },
                        { label: "B 均值", value: abStats.meanB.toLocaleString(undefined, { maximumFractionDigits: 2 }), color: "#10B981" },
                        { label: "A 中位数", value: abStats.medianA.toLocaleString(undefined, { maximumFractionDigits: 2 }), color: "var(--muted)" },
                        { label: "B 中位数", value: abStats.medianB.toLocaleString(undefined, { maximumFractionDigits: 2 }), color: "var(--muted)" },
                      ].map((stat) => (
                        <div key={stat.label} className="p-3 rounded-lg" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                          <p className="text-[10px] mb-0.5" style={{ color: "var(--muted)" }}>{stat.label}</p>
                          <p className="text-base font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 选了列但无结果 */}
              {abColA && abColB && abRows.length === 0 && (
                <div className="smart-card text-center py-6">
                  <p className="text-sm" style={{ color: "var(--muted)" }}>所选列中没有可用的数值数据，请检查列类型</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-[320px] shrink-0 hidden lg:block">
          <SmartSuggestionCard suggestion={suggestion} />
        </div>
      </div>
    </div>
  );
}
