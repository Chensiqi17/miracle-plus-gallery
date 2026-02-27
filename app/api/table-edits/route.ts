import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { TableEdits } from "@/lib/types";

const KEY = "table-edits";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function parseBody(raw: unknown): TableEdits | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const columns = Array.isArray(r.columns) ? r.columns : [];
  const cellData = r.cellData && typeof r.cellData === "object" ? (r.cellData as Record<string, Record<string, string>>) : {};
  return {
    columns,
    cellData,
    columnOrder: Array.isArray(r.columnOrder) ? r.columnOrder : undefined,
    colWidths: r.colWidths && typeof r.colWidths === "object" ? (r.colWidths as Record<string, number>) : undefined,
  };
}

/** GET: 从 Redis 读取表格编辑（优先用 KV，无则前端用 repo/localStorage） */
export async function GET() {
  const redis = getRedis();
  if (!redis) return NextResponse.json(null, { status: 200 });
  try {
    const raw = await redis.get(KEY);
    if (raw == null) return NextResponse.json(null, { status: 200 });
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const data = parseBody(parsed);
    if (!data) return NextResponse.json(null, { status: 200 });
    return NextResponse.json(data);
  } catch (e) {
    console.error("KV get error:", e);
    return NextResponse.json(null, { status: 200 });
  }
}

/** POST: 保存到 Redis（需 TABLE_SAVE_SECRET），秒存 */
export async function POST(req: NextRequest) {
  const secret = process.env.TABLE_SAVE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "TABLE_SAVE_SECRET not configured" }, { status: 503 });
  }
  const auth = req.headers.get("x-save-secret") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (auth !== secret) {
    return NextResponse.json({ error: "Invalid or missing secret" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "KV not configured. Add Upstash Redis in Vercel Integrations." },
      { status: 503 }
    );
  }

  let body: TableEdits;
  try {
    const raw = await req.json();
    body = parseBody(raw)!;
    if (!body) throw new Error("Invalid body");
  } catch {
    return NextResponse.json({ error: "Invalid JSON: columns and cellData required" }, { status: 400 });
  }

  try {
    await redis.set(KEY, JSON.stringify(body));
  } catch (e) {
    console.error("KV set error:", e);
    return NextResponse.json({ error: "Failed to save" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, message: "Saved." });
}
