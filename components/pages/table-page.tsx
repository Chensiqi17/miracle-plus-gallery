"use client";

import { useState, useMemo, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Project, Batch } from "@/lib/types";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dictionary, Locale } from "@/lib/dictionary";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Plus,
  X,
  Download,
} from "lucide-react";

interface TablePageProps {
  initialProjects: Project[];
  batches: Batch[];
  lang: Locale;
  dict: Dictionary;
}

type SortKey = "batch_id" | "name" | "one_liner" | "tags" | "founders";
type SortDir = "asc" | "desc";

const LS_COLS_KEY = "mp-table-custom-cols";
const LS_DATA_KEY = "mp-table-custom-data";
const LS_WIDTHS_KEY = "mp-table-col-widths";

/** 多选列存储时多个值用此分隔 */
const MULTI_SEP = "、";

export type CustomColumnType = "text" | "multiselect";

export interface CustomColumn {
  name: string;
  type: CustomColumnType;
  options?: string[]; // 仅 multiselect 时有值
}

function normalizeCustomCols(raw: unknown): CustomColumn[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return { name: item, type: "text" as const };
    if (item && typeof item === "object" && "name" in item && typeof (item as CustomColumn).name === "string") {
      const c = item as CustomColumn;
      return {
        name: c.name,
        type: c.type === "multiselect" ? "multiselect" : "text",
        options: Array.isArray(c.options) ? c.options.filter((x) => typeof x === "string") : undefined,
      };
    }
    return { name: String(item), type: "text" as const };
  });
}

const DEFAULT_WIDTHS: Record<string, number> = {
  batch_id: 90,
  name: 140,
  one_liner: 240,
  description: 320,
  tags: 280,
  founders: 400,
};
const DEFAULT_CUSTOM_WIDTH = 200;
const MIN_COL_WIDTH = 60;

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function csvEscape(s: string): string {
  const t = String(s ?? "").replace(/"/g, '""');
  return /[,\n\r"]/.test(t) ? `"${t}"` : t;
}

function projectTagsString(p: Project): string {
  const eduSet = new Set<string>();
  const workSet = new Set<string>();
  (p.founders || []).forEach((f) => {
    (f.education || []).forEach((e) => eduSet.add(e));
    (f.work_history || []).forEach((w) => workSet.add(w));
  });
  const parts = [...(p.tags || []), ...Array.from(eduSet).map((e) => `🎓${e}`), ...Array.from(workSet).map((w) => `💼${w}`)];
  return parts.join("、");
}

function parseMultiValue(s: string): string[] {
  if (!s?.trim()) return [];
  return s.split(MULTI_SEP).map((x) => x.trim()).filter(Boolean);
}

function projectFoundersString(founders?: Project["founders"]): string {
  if (!founders?.length) return "";
  return founders
    .map(
      (f) =>
        [f.name, f.role, f.bio, `教育：${(f.education || []).join("；")}`, `工作：${(f.work_history || []).join("；")}`]
          .filter(Boolean)
          .join("\n")
    )
    .join("\n\n");
}

export default function TablePage({
  initialProjects,
  batches,
  lang,
  dict,
}: TablePageProps) {
  const t = dict.table || {
    title: "数据表格",
    subtitle: "按批次、标签筛选，点击表头排序；表格展示全量原始信息",
    filter_batch: "批次",
    filter_tag: "标签",
    filter_all: "全部",
    reset: "重置筛选",
    count: "共 {count} 条",
    columns: {
      batch: "批次",
      name: "项目名称",
      one_liner: "一句话介绍",
      description: "项目简介",
      tags: "标签",
      founders_full: "团队介绍",
    },
  };

  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("batch_id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // --- Custom columns ---
  const [customCols, setCustomCols] = useState<CustomColumn[]>([]);
  const customDataRef = useRef<Record<string, Record<string, string>>>({});
  const [customDataVersion, setCustomDataVersion] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // --- Column widths ---
  const [colWidths, setColWidths] = useState<Record<string, number>>(DEFAULT_WIDTHS);
  const colWidthsRef = useRef(colWidths);
  colWidthsRef.current = colWidths;

  useEffect(() => {
    const raw = loadJson<unknown>(LS_COLS_KEY, []);
    setCustomCols(normalizeCustomCols(raw));
    customDataRef.current = loadJson<Record<string, Record<string, string>>>(LS_DATA_KEY, {});
    setCustomDataVersion((v) => v + 1);
    setColWidths({ ...DEFAULT_WIDTHS, ...loadJson<Record<string, number>>(LS_WIDTHS_KEY, {}) });
    setIsHydrated(true);
  }, []);

  const persistCols = useCallback((cols: CustomColumn[]) => {
    setCustomCols(cols);
    localStorage.setItem(LS_COLS_KEY, JSON.stringify(cols));
  }, []);

  const persistWidths = useCallback((widths: Record<string, number>) => {
    setColWidths(widths);
    localStorage.setItem(LS_WIDTHS_KEY, JSON.stringify(widths));
  }, []);

  const addColumn = useCallback(() => {
    const namePrompt = lang === "zh" ? "请输入列名：" : "Enter column name:";
    const name = window.prompt(namePrompt);
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (customCols.some((c) => c.name === trimmed)) {
      window.alert(lang === "zh" ? "该列已存在" : "Column already exists");
      return;
    }
    const typePrompt =
      lang === "zh"
        ? "列类型：输入 1 或 纯文本（默认）；输入 2 或 多选 = 多选 Tag 列"
        : "Column type: 1 or text (default); 2 or multiselect = multi-select tag column";
    const typeInput = (window.prompt(typePrompt) ?? "1").trim().toLowerCase();
    const isMultiselect = typeInput === "2" || typeInput === "多选" || typeInput === "multiselect";
    let options: string[] | undefined;
    if (isMultiselect) {
      const optPrompt =
        lang === "zh"
          ? "请输入可选值，用逗号或顿号分隔（例如：跟进中、已放弃、待联系）"
          : "Enter options separated by commas (e.g. Following, Pass, To contact)";
      const optRaw = window.prompt(optPrompt) ?? "";
      options = optRaw
        .split(/[,、\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (options.length === 0) options = ["—"];
    }
    const newCol: CustomColumn = {
      name: trimmed,
      type: isMultiselect ? "multiselect" : "text",
      ...(options && options.length > 0 ? { options } : {}),
    };
    persistCols([...customCols, newCol]);
  }, [customCols, persistCols, lang]);

  const removeColumn = useCallback(
    (colName: string) => {
      const yes = window.confirm(
        lang === "zh"
          ? `确认删除「${colName}」列？数据将丢失。`
          : `Delete column "${colName}"? Data will be lost.`
      );
      if (!yes) return;
      persistCols(customCols.filter((c) => c.name !== colName));
      const next = { ...customDataRef.current };
      for (const pid of Object.keys(next)) {
        if (next[pid]?.[colName] !== undefined) {
          const { [colName]: _, ...rest } = next[pid];
          next[pid] = rest;
        }
      }
      customDataRef.current = next;
      localStorage.setItem(LS_DATA_KEY, JSON.stringify(next));
      setCustomDataVersion((v) => v + 1);
    },
    [customCols, persistCols, lang]
  );

  const updateCell = useCallback((projectId: string, colName: string, value: string) => {
    const next = { ...customDataRef.current };
    if (!next[projectId]) next[projectId] = {};
    next[projectId] = { ...next[projectId], [colName]: value };
    customDataRef.current = next;
    localStorage.setItem(LS_DATA_KEY, JSON.stringify(next));
    setCustomDataVersion((v) => v + 1);
  }, []);

  const getCustomCell = useCallback(
    (projectId: string, colName: string) => {
      void customDataVersion;
      return customDataRef.current[projectId]?.[colName] || "";
    },
    [customDataVersion]
  );

  // --- Tags ---
  const { domainTags, eduTags, workTags } = useMemo(() => {
    const dSet = new Set<string>();
    const eSet = new Set<string>();
    const wSet = new Set<string>();
    initialProjects.forEach((p) => {
      p.tags?.forEach((tag) => dSet.add(tag));
      (p.founders || []).forEach((f) => {
        (f.education || []).forEach((e) => eSet.add(e));
        (f.work_history || []).forEach((w) => wSet.add(w));
      });
    });
    return {
      domainTags: Array.from(dSet).sort(),
      eduTags: Array.from(eSet).sort(),
      workTags: Array.from(wSet).sort(),
    };
  }, [initialProjects]);

  // --- Full-text search ---
  const buildSearchText = useCallback((p: Project) => {
    const parts = [p.batch_id, p.name, p.one_liner, p.description, ...(p.tags || [])];
    (p.founders || []).forEach((f) => {
      parts.push(f.name, f.role, f.bio);
      parts.push(...(f.education || []));
      parts.push(...(f.work_history || []));
    });
    return parts.filter(Boolean).join(" ").toLowerCase();
  }, []);

  // --- Filter + sort ---
  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = initialProjects.filter((p) => {
      if (batchFilter !== "all" && p.batch_id !== batchFilter) return false;
      if (tagFilter !== "all") {
        if (tagFilter.startsWith("edu:")) {
          const v = tagFilter.slice(4);
          if (!(p.founders || []).some((f) => (f.education || []).includes(v))) return false;
        } else if (tagFilter.startsWith("work:")) {
          const v = tagFilter.slice(5);
          if (!(p.founders || []).some((f) => (f.work_history || []).includes(v))) return false;
        } else {
          if (!p.tags?.includes(tagFilter)) return false;
        }
      }
      if (q) {
        const text = buildSearchText(p);
        const keywords = q.split(/\s+/);
        if (!keywords.every((kw) => text.includes(kw))) return false;
      }
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      let va: string, vb: string;
      switch (sortKey) {
        case "batch_id": va = a.batch_id; vb = b.batch_id; break;
        case "name": va = a.name; vb = b.name; break;
        case "one_liner": va = a.one_liner || ""; vb = b.one_liner || ""; break;
        case "tags": va = (a.tags || []).join(","); vb = (b.tags || []).join(","); break;
        case "founders": va = (a.founders || []).map((f) => f.name).join(","); vb = (b.founders || []).map((f) => f.name).join(","); break;
        default: va = a.batch_id; vb = b.batch_id;
      }
      return String(va).localeCompare(String(vb), "zh") * dir;
    });
    return list;
  }, [initialProjects, batchFilter, tagFilter, searchQuery, sortKey, sortDir, buildSearchText]);

  const exportTable = useCallback(() => {
    const rows = filteredAndSorted;
    const headers = [
      t.columns.batch,
      t.columns.name,
      t.columns.one_liner,
      t.columns.description,
      t.columns.tags,
      t.columns.founders_full,
      ...customCols.map((c) => c.name),
    ];
    const headerLine = headers.map(csvEscape).join(",");
    const dataLines = rows.map((p) => {
      const customData = customDataRef.current;
      const customVals = customCols.map((col) => customData[p.id]?.[col.name] ?? "");
      return [
        csvEscape(p.batch_id),
        csvEscape(p.name),
        csvEscape(p.one_liner ?? ""),
        csvEscape(p.description ?? ""),
        csvEscape(projectTagsString(p)),
        csvEscape(projectFoundersString(p.founders)),
        ...customVals.map(csvEscape),
      ].join(",");
    });
    const csv = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `miracle-plus-table-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredAndSorted, customCols, t.columns]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3.5 w-3 opacity-50" />;
    return sortDir === "asc" ? <ArrowUp className="h-3.5 w-3" /> : <ArrowDown className="h-3.5 w-3" />;
  };

  // --- Resize ---
  const dragRef = useRef<{ colKey: string; startX: number; startW: number } | null>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const newW = Math.max(MIN_COL_WIDTH, drag.startW + dx);
      const colKey = drag.colKey;
      setColWidths((prev) => ({ ...prev, [colKey]: newW }));
    };
    const onMouseUp = () => {
      const hadDrag = dragRef.current !== null;
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (hadDrag) localStorage.setItem(LS_WIDTHS_KEY, JSON.stringify(colWidthsRef.current));
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const startResize = useCallback((colKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startW = colWidthsRef.current[colKey] ?? (DEFAULT_WIDTHS[colKey] || DEFAULT_CUSTOM_WIDTH);
    dragRef.current = { colKey, startX: e.clientX, startW };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const getW = useCallback(
    (key: string) => colWidths[key] ?? (DEFAULT_WIDTHS[key] || DEFAULT_CUSTOM_WIDTH),
    [colWidths]
  );

  const builtinCols = ["batch_id", "name", "one_liner", "description", "tags", "founders"] as const;

  const totalWidth = useMemo(() => {
    let w = 0;
    for (const c of builtinCols) w += getW(c);
    if (isHydrated) for (const c of customCols) w += getW(`custom:${c.name}`);
    return w;
  }, [builtinCols, customCols, getW, isHydrated]);

  const ResizeHandle = ({ colKey }: { colKey: string }) => (
    <div
      data-resize-handle
      role="separator"
      aria-label={lang === "zh" ? "拖拽调整列宽" : "Drag to resize column"}
      className="absolute right-0 top-0 bottom-0 w-2 -mr-1 cursor-col-resize z-20 hover:bg-primary/20 active:bg-primary/40 transition-colors"
      onMouseDown={(e) => startResize(colKey, e)}
    />
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar lang={lang} dict={dict} />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "zh" ? "搜索项目名、简介、创始人、学校、公司…" : "Search projects, founders, schools, companies…"}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{t.filter_batch}</span>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.filter_all}</SelectItem>
                {batches.map((b) => <SelectItem key={b.id} value={b.id}>{b.id} {b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{t.filter_tag}</span>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-[400px]">
                <SelectItem value="all">{t.filter_all}</SelectItem>
                <SelectItem value="__header_domain" disabled>── 领域 ──</SelectItem>
                {domainTags.map((tag) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                <SelectItem value="__header_edu" disabled>── 教育 ──</SelectItem>
                {eduTags.map((tag) => <SelectItem key={`edu:${tag}`} value={`edu:${tag}`}>🎓 {tag}</SelectItem>)}
                <SelectItem value="__header_work" disabled>── 工作 ──</SelectItem>
                {workTags.map((tag) => <SelectItem key={`work:${tag}`} value={`work:${tag}`}>💼 {tag}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setBatchFilter("all"); setTagFilter("all"); setSearchQuery(""); }}>
            {t.reset}
          </Button>
          <span className="text-sm text-muted-foreground ml-2">
            {t.count.replace("{count}", String(filteredAndSorted.length))}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportTable}>
              <Download className="h-3.5 w-3.5 mr-1" />
              {lang === "zh" ? "导出表格" : "Export CSV"}
            </Button>
            <Button variant="outline" size="sm" onClick={addColumn}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              {lang === "zh" ? "添加自定义列" : "Add Column"}
            </Button>
          </div>
        </div>

        {/* Table: minWidth so columns can't be compressed; col widths in px so resize works */}
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="text-sm border-collapse"
              style={{ tableLayout: "fixed", width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}
            >
              <colgroup>
                {builtinCols.map((c) => (
                  <col key={c} style={{ width: `${getW(c)}px`, minWidth: `${getW(c)}px` }} />
                ))}
                {isHydrated && customCols.map((c) => (
                  <col key={`custom:${c.name}`} style={{ width: `${getW(`custom:${c.name}`)}px`, minWidth: `${getW(`custom:${c.name}`)}px` }} />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-muted/50 border-b border-border/60">
                  <th className="text-left font-semibold p-3 cursor-pointer hover:bg-muted/80 transition-colors relative select-none w-0 align-top" onClick={(e) => { if ((e.target as HTMLElement).closest("[data-resize-handle]")) return; toggleSort("batch_id"); }}>
                    <div className="min-w-0 overflow-hidden pr-4">{t.columns.batch} <SortIcon column="batch_id" /></div>
                    <ResizeHandle colKey="batch_id" />
                  </th>
                  <th className="text-left font-semibold p-3 cursor-pointer hover:bg-muted/80 transition-colors relative select-none w-0 align-top" onClick={(e) => { if ((e.target as HTMLElement).closest("[data-resize-handle]")) return; toggleSort("name"); }}>
                    <div className="min-w-0 overflow-hidden break-words pr-4">{t.columns.name} <SortIcon column="name" /></div>
                    <ResizeHandle colKey="name" />
                  </th>
                  <th className="text-left font-semibold p-3 relative select-none w-0 align-top">
                    <div className="min-w-0 overflow-hidden break-words pr-4">{t.columns.one_liner}</div>
                    <ResizeHandle colKey="one_liner" />
                  </th>
                  <th className="text-left font-semibold p-3 relative select-none w-0 align-top">
                    <div className="min-w-0 overflow-hidden break-words pr-4">{t.columns.description}</div>
                    <ResizeHandle colKey="description" />
                  </th>
                  <th className="text-left font-semibold p-3 relative select-none w-0 align-top">
                    <div className="min-w-0 overflow-hidden break-words pr-4">{t.columns.tags}</div>
                    <ResizeHandle colKey="tags" />
                  </th>
                  <th className="text-left font-semibold p-3 cursor-pointer hover:bg-muted/80 transition-colors relative select-none w-0 align-top" onClick={(e) => { if ((e.target as HTMLElement).closest("[data-resize-handle]")) return; toggleSort("founders"); }}>
                    <div className="min-w-0 overflow-hidden break-words pr-4">{t.columns.founders_full} <SortIcon column="founders" /></div>
                    <ResizeHandle colKey="founders" />
                  </th>
                  {isHydrated && customCols.map((col) => (
                    <th key={col.name} className="text-left font-semibold p-3 group relative select-none w-0 align-top">
                      <div className="min-w-0 overflow-hidden break-words pr-4">
                        <span className="inline-flex items-center gap-1.5 flex-wrap">
                          {col.name}
                          {col.type === "multiselect" && (
                            <span className="text-xs text-muted-foreground font-normal">
                              {lang === "zh" ? "(多选)" : "(multi)"}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeColumn(col.name); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                            title={lang === "zh" ? "删除此列" : "Delete column"}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </div>
                      <ResizeHandle colKey={`custom:${col.name}`} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors align-top">
                    <td className="p-3 font-mono text-muted-foreground align-top w-0">
                      <div className="min-w-0 overflow-hidden">{p.batch_id}</div>
                    </td>
                    <td className="p-3 font-medium align-top w-0">
                      <div className="min-w-0 overflow-hidden break-words">{p.name}</div>
                    </td>
                    <td className="p-3 text-muted-foreground align-top w-0">
                      <div className="min-w-0 overflow-hidden break-words whitespace-pre-wrap">{p.one_liner || "—"}</div>
                    </td>
                    <td className="p-3 text-muted-foreground align-top w-0">
                      <div className="min-w-0 overflow-hidden break-words whitespace-pre-wrap">{p.description || "—"}</div>
                    </td>
                    <td className="p-3 align-top w-0">
                      <div className="min-w-0 overflow-hidden break-words">
                        <TagsCell project={p} />
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground align-top w-0">
                      <div className="min-w-0 overflow-hidden break-words whitespace-pre-wrap">
                        <FoundersCell founders={p.founders} />
                      </div>
                    </td>
                    {isHydrated && customCols.map((col) =>
                      col.type === "multiselect" ? (
                        <MultiSelectCell
                          key={col.name}
                          value={getCustomCell(p.id, col.name)}
                          options={col.options ?? []}
                          onChange={(v) => updateCell(p.id, col.name, v)}
                          placeholder={lang === "zh" ? "点击选择…" : "Click to select…"}
                        />
                      ) : (
                        <EditableCell
                          key={col.name}
                          value={getCustomCell(p.id, col.name)}
                          onChange={(v) => updateCell(p.id, col.name, v)}
                          placeholder={lang === "zh" ? "点击编辑…" : "Click to edit…"}
                        />
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAndSorted.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            {lang === "zh" ? "暂无符合条件的数据，请调整筛选条件。" : "No matching data. Please adjust filters."}
          </p>
        )}
      </main>
    </div>
  );
}

/* ── Sub-components ── */

function TagsCell({ project: p }: { project: Project }) {
  const eduSet = new Set<string>();
  const workSet = new Set<string>();
  (p.founders || []).forEach((f) => {
    (f.education || []).forEach((e) => eduSet.add(e));
    (f.work_history || []).forEach((w) => workSet.add(w));
  });
  const hasDomain = (p.tags || []).length > 0;
  const hasEdu = eduSet.size > 0;
  const hasWork = workSet.size > 0;
  if (!hasDomain && !hasEdu && !hasWork) return <span>—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {(p.tags || []).map((tag) => (
        <span key={tag} className="inline-block text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{tag}</span>
      ))}
      {Array.from(eduSet).map((e) => (
        <span key={`edu-${e}`} className="inline-block text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400">🎓 {e}</span>
      ))}
      {Array.from(workSet).map((w) => (
        <span key={`work-${w}`} className="inline-block text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">💼 {w}</span>
      ))}
    </div>
  );
}

function FoundersCell({ founders }: { founders?: Project["founders"] }) {
  if (!founders || founders.length === 0) return <span>—</span>;
  return (
    <>
      {founders.map((f, i) => (
        <div key={i} className="mb-4 last:mb-0 border-b border-border/30 pb-3 last:border-0 last:pb-0">
          <div className="font-medium text-foreground">{f.name}</div>
          <div className="text-xs text-muted-foreground/80 mt-0.5">{f.role || ""}</div>
          <div className="mt-1">{f.bio || ""}</div>
          <div className="mt-1 text-xs"><span className="font-medium">教育：</span>{(f.education || []).join("；") || "—"}</div>
          <div className="mt-0.5 text-xs"><span className="font-medium">工作：</span>{(f.work_history || []).join("；") || "—"}</div>
        </div>
      ))}
    </>
  );
}

function MultiSelectCell({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseMultiValue(value), [value]);
  const [draft, setDraft] = useState<string[]>(selected);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    setDraft(parseMultiValue(value));
  }, [value]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setDropdownRect(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownRect({ left: rect.left, top: rect.bottom + 4 });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      const portalRoot = document.getElementById("multiselect-dropdown-portal");
      if (portalRoot?.contains(target)) return;
      setOpen(false);
      const next = draft.join(MULTI_SEP);
      if (next !== value) onChange(next);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open, draft, value, onChange]);

  if (options.length === 0) {
    return (
      <td className="p-3 align-top w-0">
        <span className="text-muted-foreground/40 text-xs italic">{placeholder}</span>
      </td>
    );
  }

  const dropdownContent =
    open &&
    dropdownRect &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        id="multiselect-dropdown-portal"
        className="min-w-[140px] max-h-[220px] overflow-y-auto rounded-md border bg-popover text-popover-foreground p-2 shadow-md z-[100]"
        style={{
          position: "fixed",
          left: dropdownRect.left,
          top: dropdownRect.top,
        }}
      >
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/80 cursor-pointer text-sm"
          >
            <Checkbox
              checked={draft.includes(opt)}
              onCheckedChange={(checked) => {
                setDraft((prev) =>
                  checked === true ? [...prev, opt] : prev.filter((x) => x !== opt)
                );
              }}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>,
      document.body
    );

  return (
    <td className="p-3 align-top w-0">
      <div
        ref={triggerRef}
        className="min-w-0 overflow-hidden break-words cursor-pointer hover:bg-muted/50 transition-colors rounded border border-transparent hover:border-border/50"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((opt) => (
              <span
                key={opt}
                className="inline-block text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary"
              >
                {opt}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground/40 text-xs italic">{placeholder}</span>
        )}
      </div>
      {dropdownContent}
    </td>
  );
}

function EditableCell({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  if (editing) {
    return (
      <td className="p-1.5 align-top w-0">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setDraft(value); setEditing(false); }
          }}
          className="w-full min-h-[60px] max-w-full p-2 text-sm border border-ring rounded-md bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring box-border"
        />
      </td>
    );
  }

  return (
    <td className="p-3 align-top w-0 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setEditing(true)}>
      <div className="min-w-0 overflow-hidden break-words whitespace-pre-wrap">
        {value ? (
          <span className="text-sm">{value}</span>
        ) : (
          <span className="text-muted-foreground/40 text-xs italic">{placeholder}</span>
        )}
      </div>
    </td>
  );
}
