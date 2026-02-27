import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Octokit } from "octokit";
import type { TableEdits } from "@/lib/types";

const KV_KEY = "table-edits";
const FILE_PATH = "data/table-edits.json";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getRepo(): { owner: string; repo: string } | null {
  const repo = process.env.GITHUB_REPO;
  if (!repo || !repo.includes("/")) return null;
  const [owner, name] = repo.split("/", 2);
  return owner && name ? { owner, repo: name } : null;
}

/** POST: 把 Redis 里当前表格编辑推到 Git（需密码 + GITHUB_TOKEN） */
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
    return NextResponse.json({ error: "KV not configured" }, { status: 503 });
  }

  const raw = await redis.get(KV_KEY);
  if (raw == null) {
    return NextResponse.json({ error: "No data in KV to sync. Save the table first (点「保存」)." }, { status: 400 });
  }
  let body: TableEdits;
  if (typeof raw === "string") {
    try {
      body = JSON.parse(raw) as TableEdits;
    } catch {
      return NextResponse.json({ error: "Invalid data in KV" }, { status: 400 });
    }
  } else if (raw && typeof raw === "object" && "cellData" in raw) {
    body = raw as unknown as TableEdits;
  } else {
    return NextResponse.json({ error: "Invalid data in KV" }, { status: 400 });
  }
  if (!body.columns && (!body.cellData || Object.keys(body.cellData).length === 0)) {
    return NextResponse.json({ error: "KV data is empty. Save the table first." }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN ?? process.env.TABLE_EDIT_GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 503 });
  }
  const repo = getRepo();
  if (!repo) {
    return NextResponse.json({ error: "GITHUB_REPO not configured" }, { status: 503 });
  }

  const octokit = new Octokit({ auth: token });
  const content = Buffer.from(JSON.stringify(body, null, 2), "utf8").toString("base64");

  try {
    const branch = process.env.GITHUB_BRANCH || "main";
    const { data: existing } = await octokit.rest.repos
      .getContent({ ...repo, path: FILE_PATH, ref: branch })
      .catch(() => ({ data: null }));
    const sha = existing && !Array.isArray(existing) && "sha" in existing ? (existing as { sha: string }).sha : undefined;

    await octokit.rest.repos.createOrUpdateFileContents({
      ...repo,
      path: FILE_PATH,
      message: "chore: sync table edits from KV to repo",
      content,
      sha,
      branch,
      committer: { name: "table-sync-bot", email: "table-sync@localhost" },
      author: { name: "table-sync-bot", email: "table-sync@localhost" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("GitHub API error:", msg);
    return NextResponse.json({ error: "Failed to push to GitHub", details: msg }, { status: 502 });
  }

  return NextResponse.json({ ok: true, message: "Synced to repo." });
}
