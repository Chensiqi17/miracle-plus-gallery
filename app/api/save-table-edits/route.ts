import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import type { TableEdits } from "@/lib/types";

const FILE_PATH = "data/table-edits.json";

function getRepo(): { owner: string; repo: string } | null {
  const repo = process.env.GITHUB_REPO; // e.g. "owner/repo"
  if (!repo || !repo.includes("/")) return null;
  const [owner, name] = repo.split("/", 2);
  return owner && name ? { owner, repo: name } : null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.TABLE_SAVE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "TABLE_SAVE_SECRET not configured" },
      { status: 503 }
    );
  }
  const authHeader = req.headers.get("x-save-secret") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (authHeader !== secret) {
    return NextResponse.json({ error: "Invalid or missing secret" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN ?? process.env.TABLE_EDIT_GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN or TABLE_EDIT_GITHUB_TOKEN not configured" },
      { status: 503 }
    );
  }

  const repo = getRepo();
  if (!repo) {
    return NextResponse.json(
      { error: "GITHUB_REPO not configured (e.g. owner/repo)" },
      { status: 503 }
    );
  }

  let body: TableEdits;
  try {
    const raw = await req.json();
    if (!raw || typeof raw !== "object") throw new Error("Invalid body");
    const columns = Array.isArray(raw.columns) ? raw.columns : [];
    const cellData = raw.cellData && typeof raw.cellData === "object" ? raw.cellData : {};
    body = {
      columns,
      cellData,
      columnOrder: Array.isArray(raw.columnOrder) ? raw.columnOrder : undefined,
      colWidths: raw.colWidths && typeof raw.colWidths === "object" ? raw.colWidths : undefined,
    };
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid JSON body: columns and cellData required" },
      { status: 400 }
    );
  }

  const octokit = new Octokit({ auth: token });
  const content = Buffer.from(JSON.stringify(body, null, 2), "utf8").toString("base64");

  try {
    const branch = process.env.GITHUB_BRANCH || "main";
    const { data: existing } = await octokit.rest.repos.getContent({
      ...repo,
      path: FILE_PATH,
      ref: branch,
    }).catch(() => ({ data: null }));

    const sha = existing && !Array.isArray(existing) && "sha" in existing ? existing.sha : undefined;

    await octokit.rest.repos.createOrUpdateFileContents({
      ...repo,
      path: FILE_PATH,
      message: "chore: save table edits from web",
      content,
      sha,
      branch,
      committer: { name: "table-save-bot", email: "table-save@localhost" },
      author: { name: "table-save-bot", email: "table-save@localhost" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("GitHub API error:", msg);
    return NextResponse.json(
      { error: "Failed to push to GitHub", details: msg },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, message: "Saved to repo; next deploy will show changes." });
}
