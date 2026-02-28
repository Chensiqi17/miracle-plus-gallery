export interface Founder {
  name: string;
  role: string;
  bio: string;
  education: string[];
  work_history: string[];
}

export interface Project {
  id: string;
  batch_id: string;
  name: string;
  one_liner: string;
  description: string;
  image_url: string;
  founders: Founder[];
  tags: string[];
}

export interface BatchStats {
  project_count: number;
  acceptance_rate: string;
  phd_ratio?: string;
  researcher_founder_ratio?: string;
  overseas_experience?: string;
  [key: string]: any;
}

export interface Batch {
  id: string;
  name: string;
  year: number;
  season: 'Spring' | 'Fall';
  date: string;
  location: string;
  stats: BatchStats;
  highlights: string[];
  description: string;
  disabled?: boolean;
}

/** 原字段的覆盖（表格内编辑项目名称、简介等后存于此，不直接改 batch JSON） */
export type ProjectOverrides = Record<
  string,
  { name?: string; one_liner?: string; description?: string; tags?: string[] }
>;

/**
 * 项目 ID 规则（与解析脚本一致）：
 * - 当前为「批次 + 序号」，如 2023F-001、2022F-002，由 parse 脚本按 MD 中项目出现顺序生成。
 * - 仅改 MD 内容、不改项目顺序时，重新解析后 ID 不变，表格内 overrides/cellData 仍正确对应。
 * - 若在 MD 中增删或调换项目顺序，序号会变，原 ID 会对应到不同项目（错位）；表格内会检测「孤立数据」并提示清除。
 * - ID 与项目名无关：在表格里改项目名不会改变 ID；在 MD 里改项目名后重新解析，同一位置仍是同一 ID。
 */

/** 表格页「保存到仓库」使用的编辑数据，存于 data/table-edits.json / KV */
export interface TableEdits {
  columns: { name: string; type: "text" | "multiselect"; options?: string[] }[];
  cellData: Record<string, Record<string, string>>;
  /** 原字段覆盖：projectId -> 只包含有改动的字段 */
  overrides?: ProjectOverrides;
  columnOrder?: string[];
  colWidths?: Record<string, number>;
}
