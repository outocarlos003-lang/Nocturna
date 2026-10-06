#!/usr/bin/env node
import fs from "node:fs";

const OWNER = "outocarlos003-lang";
const REPO = "Nocturna";
const ISSUE = 1;
const PATH = "data/comments/issue-1.json";
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("GITHUB_TOKEN obrigatorio");

const data = JSON.parse(fs.readFileSync(PATH, "utf8"));
const nodes = Array.isArray(data.nodes) ? data.nodes : [];
const byNode = new Map();
const bySource = new Map();
for (const node of nodes) {
  const nodeId = String(node.nodeId);
  const sourceId = String(node.sourceId);
  if (byNode.has(nodeId)) throw new Error(`nodeId duplicado na projecao: ${nodeId}`);
  if (bySource.has(sourceId)) throw new Error(`sourceId duplicado na projecao: ${sourceId}`);
  byNode.set(nodeId, node);
  bySource.set(sourceId, node);
}

const rootNode = byNode.get(String(data.issue?.rootNodeId));
if (!rootNode) throw new Error("raiz genealogica ausente");
if (rootNode.author?.displayName !== "Johan Liebert") throw new Error("a raiz genealogica deve ser Johan Liebert");
if (rootNode.parentNodeId !== null) throw new Error("a raiz genealogica possui pai");
if (!rootNode.commentId) throw new Error("raiz genealogica sem comentario GitHub");

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
  const body = await response.json();
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${body.message || "erro"}`);
  return body;
};

const escapeMeta = (value) => String(value).replace(/\\/g, "\\\\").replace(/\r?\n/g, " ");
const nodeMarker = (node) => `<!-- nocturna-node:v1 ${JSON.stringify({
  nodeId: String(node.nodeId),
  sourceId: String(node.sourceId),
  parentNodeId: node.parentNodeId === null ? null : String(node.parentNodeId),
  rootNodeId: String(data.issue.rootNodeId),
  depth: Number(node.depth),
  author: String(node.author?.displayName || "")
})} -->`;
const expectedBody = (node, parent) => [
  nodeMarker(node),
  "",
  `> **Nocturna genealogy** · node ${escapeMeta(node.nodeId)} · depth ${Number(node.depth)}`,
  `> Pai: node ${escapeMeta(node.parentNodeId)} · comentário GitHub #${escapeMeta(parent.commentId)}`,
  `> Autor semântico: ${escapeMeta(node.author?.displayName || "")}`,
  "",
  String(node.content || "").trim()
].join("\n");

const parseNodeMarker = (body) => {
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

const liveByNode = new Map();
const liveBySource = new Map();
for (const comment of comments) {
  const marker = parseNodeMarker(comment.body);
  if (!marker) continue;
  if (marker.nodeId) {
    const key = String(marker.nodeId);
    if (liveByNode.has(key)) throw new Error(`mais de um comentario GitHub materializa o node ${key}`);
    liveByNode.set(key, comment);
  }
  if (marker.sourceId) {
    const key = String(marker.sourceId);
    if (liveBySource.has(key)) throw new Error(`mais de um comentario GitHub materializa o sourceId ${key}`);
    liveBySource.set(key, comment);
  }
}

const pending = nodes
  .filter((node) => String(node.nodeId) !== String(rootNode.nodeId))
  .sort((a, b) => Number(a.depth) - Number(b.depth) || Number(a.order || 0) - Number(b.order || 0) || Number(a.nodeId) - Number(b.nodeId));

let changed = false;
let published = 0;
let reconciled = 0;

for (const node of pending) {
  const nodeId = String(node.nodeId);
  const sourceId = String(node.sourceId);
  let comment = liveByNode.get(nodeId) || liveBySource.get(sourceId);

  if (!comment) {
    const parent = byNode.get(String(node.parentNodeId));
    if (!parent) throw new Error(`pai genealogico ausente para ${nodeId}`);
    if (!parent.commentId) throw new Error(`pai ainda sem commentId GitHub para ${nodeId}: ${node.parentNodeId}`);

    comment = await api(`/repos/${OWNER}/${REPO}/issues/${ISSUE}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: expectedBody(node, parent) })
    });
    published += 1;
  }

  const expectedUrl = comment.html_url || `https://github.com/${OWNER}/${REPO}/issues/${ISSUE}#issuecomment-${comment.id}`;
  if (String(node.commentId) !== String(comment.id)) {
    node.commentId = comment.id;
    changed = true;
  }
  if (node.commentUrl !== expectedUrl) {
    node.commentUrl = expectedUrl;
    changed = true;
  }
  if (node.parentNodeId !== null) {
    const parent = byNode.get(String(node.parentNodeId));
    if (!parent) throw new Error(`pai genealogico ausente para ${nodeId}`);
    if (String(node.parentCommentId) !== String(parent.commentId)) {
      node.parentCommentId = parent.commentId;
      changed = true;
    }
    if (node.parentAuthor !== parent.author?.displayName) {
      node.parentAuthor = parent.author?.displayName || null;
      changed = true;
    }

    const expected = expectedBody(node, parent);
    if (String(comment.body || "") !== expected) {
      await api(`/repos/${OWNER}/${REPO}/issues/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: expected })
      });
      comment = { ...comment, body: expected };
      reconciled += 1;
    }
  }

  liveByNode.set(nodeId, comment);
  liveBySource.set(sourceId, comment);
}

data.issue.rootCommentId = rootNode.commentId;
data.issue.rootCommentUrl = rootNode.commentUrl;
data.issue.rootAuthor = "Johan Liebert";
data.issue.authority = "github";

if (changed) {
  fs.writeFileSync(PATH, `${JSON.stringify(data, null, 2)}\n`);
}
console.log(`genealogia reconciliada: ${published} publicado(s), ${reconciled} comentario(s) atualizado(s)`);
