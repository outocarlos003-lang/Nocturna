#!/usr/bin/env node

const OWNER = "outocarlos003-lang";
const REPO = "Nocturna";
const ISSUE = 1;
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("GITHUB_TOKEN obrigatorio");

const api = async (url, options = {}) => {
  const response = await fetch(`https://api.github.com${url}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body = {};
  try { body = JSON.parse(text); } catch {}
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${body.message || text}`);
  return body;
};

const marker = (body) => {
  const match = String(body || "").match(/<!-- nocturna-node:v1 (\{[\s\S]*?\}) -->/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
};

let comments = [];
for (let page = 1; ; page += 1) {
  const batch = await api(`/repos/${OWNER}/${REPO}/issues/${ISSUE}/comments?per_page=100&page=${page}`);
  comments.push(...batch);
  if (batch.length < 100) break;
}

const byNode = new Map();
const bySource = new Map();
for (const comment of comments) {
  const meta = marker(comment.body);
  if (!meta?.nodeId) continue;
  const nodeId = String(meta.nodeId);
  const sourceId = meta.sourceId == null ? null : String(meta.sourceId);
  if (!byNode.has(nodeId)) byNode.set(nodeId, []);
  byNode.get(nodeId).push(comment);
  if (sourceId) {
    if (!bySource.has(sourceId)) bySource.set(sourceId, []);
    bySource.get(sourceId).push({ comment, nodeId });
  }
}

for (const [sourceId, matches] of bySource) {
  const nodeIds = new Set(matches.map(({ nodeId }) => nodeId));
  if (nodeIds.size > 1) {
    throw new Error(`sourceId ${sourceId} aparece em nodes GitHub diferentes: ${[...nodeIds].join(", ")}`);
  }
}

let removed = 0;
for (const [nodeId, matches] of byNode) {
  if (matches.length < 2) continue;
  matches.sort((a, b) => Number(a.id) - Number(b.id));
  const [keep, ...duplicates] = matches;
  for (const duplicate of duplicates) {
    await api(`/repos/${OWNER}/${REPO}/issues/comments/${duplicate.id}`, { method: "DELETE" });
    removed += 1;
    console.log(`removido duplicado do node ${nodeId}: ${duplicate.id}; preservado ${keep.id}`);
  }
}

console.log(`deduplicacao concluida: ${removed} comentario(s) removido(s)`);
