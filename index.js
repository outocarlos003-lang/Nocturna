const GITHUB_API = "https://api.github.com";
const REPO = "outocarlos003-lang/Nocturna";
const ISSUE = 5;
const ALLOWED_ORIGIN = "https://outocarlos003-lang.github.io";
const ALLOWED_AUTHORS = new Set([
  "Akashi Seijuro",
  "Johan Liebert",
  "Ayanokoji Kiyotaka",
  "Osamu Dazai",
  "Light Yagami",
  "L Lawliet",
  "Sasuke Uchiha",
  "Ranpo Edogawa",
  "Itachi Uchiha",
  "Satoru Gojo"
]);

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed ? ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin)
  });
}

function base64url(value) {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToDer(pem) {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function derLength(length) {
  if (length < 128) return new Uint8Array([length]);
  const bytes = [];
  let n = length;
  while (n > 0) {
    bytes.unshift(n & 255);
    n >>>= 8;
  }
  return new Uint8Array([0x80 | bytes.length, ...bytes]);
}

function derTlv(tag, value) {
  const length = derLength(value.length);
  const out = new Uint8Array(1 + length.length + value.length);
  out[0] = tag;
  out.set(length, 1);
  out.set(value, 1 + length.length);
  return out;
}

function concat(...parts) {
  const size = parts.reduce((n, part) => n + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function pkcs1ToPkcs8(pkcs1) {
  const version = new Uint8Array([0x02, 0x01, 0x00]);
  const rsaOid = new Uint8Array([0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00]);
  const privateKey = derTlv(0x04, pkcs1);
  return derTlv(0x30, concat(version, rsaOid, privateKey));
}

async function signJwt(env) {
  const pem = env.GITHUB_PRIVATE_KEY.trim();
  const raw = pemToDer(pem);
  const der = pem.includes("BEGIN RSA PRIVATE KEY") ? pkcs1ToPkcs8(raw) : raw;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iat: now - 60,
    exp: now + 540,
    iss: env.GITHUB_APP_ID
  }));
  const signingInput = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput)
  );
  return `${signingInput}.${base64url(new Uint8Array(signature))}`;
}

async function githubFetch(path, options = {}) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
      "User-Agent": "Nocturna-Reply-API",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch (_) { data = { message: text }; }
  if (!response.ok) {
    const error = new Error(data?.message || `GitHub API ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function installationToken(env) {
  const jwt = await signJwt(env);
  const installation = await githubFetch(`/repos/${REPO}/installation`, {
    headers: { Authorization: `Bearer ${jwt}` }
  });
  const data = await githubFetch(`/app/installations/${encodeURIComponent(installation.id)}/access_tokens`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` }
  });
  return data.token;
}

async function ghGet(path, token) {
  return githubFetch(path, { headers: { Authorization: `Bearer ${token}` } });
}

async function ghPost(path, token, body) {
  return githubFetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

function validateRequest(input) {
  if (!input || typeof input !== "object") throw new Error("Corpo inválido.");
  if (typeof input.message !== "string" || !input.message.trim()) throw new Error("Mensagem vazia.");
  if (input.message.length > 2000) throw new Error("Mensagem excede 2000 caracteres.");
  if (typeof input.parentNode !== "string" || !/^(?:[0-9]+|external-[A-Za-z0-9_-]+)$/.test(input.parentNode)) throw new Error("Nó pai inválido.");
  if (typeof input.parentComment !== "string" || !/^(?:issue-root|[0-9]+)$/.test(input.parentComment)) throw new Error("Comentário pai inválido.");
  if (typeof input.parentAuthor !== "string" || !input.parentAuthor.trim()) throw new Error("Autor pai inválido.");
  if (typeof input.responder !== "string" || !ALLOWED_AUTHORS.has(input.responder)) throw new Error("Personagem que responde não autorizado.");
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (origin !== ALLOWED_ORIGIN) return json({ ok: false, error: "Origem não autorizada." }, 403, origin);
    if (request.method !== "POST") return json({ ok: false, error: "Método não permitido." }, 405, origin);

    try {
      const input = await request.json();
      validateRequest(input);

      const token = await installationToken(env);
      let parentLink = `https://github.com/${REPO}/issues/${ISSUE}`;

      if (input.parentNode === "2") {
        if (input.parentComment !== "issue-root" || input.parentAuthor !== "Johan Liebert") {
          throw new Error("A raiz do nó 2 é inválida.");
        }
      } else {
        if (input.parentComment === "issue-root") throw new Error("Somente o nó 2 pode apontar para a raiz.");
        const parent = await ghGet(`/repos/${REPO}/issues/comments/${input.parentComment}`, token);
        const parentBody = String(parent.body || "");
        const parentLogin = String(parent.user?.login || "");

        if (/^[0-9]+$/.test(input.parentNode)) {
          if (!parentBody.includes(`nocturna-node:${input.parentNode} `)) throw new Error("Comentário pai não corresponde ao nó informado.");
          if (!parentBody.includes(`**${input.parentAuthor}**`)) throw new Error("Comentário pai não corresponde ao personagem informado.");
        } else if (input.parentNode.startsWith("external-")) {
          if (parentLogin !== input.parentAuthor) throw new Error("Autor externo do comentário pai não corresponde.");
        }
        parentLink = `https://github.com/${REPO}/issues/${ISSUE}#issuecomment-${input.parentComment}`;
      }

      const body = [
        `<!-- nocturna-parent-node: ${input.parentNode} -->`,
        `<!-- nocturna-parent-comment: ${input.parentComment} -->`,
        `<!-- nocturna-parent-author: ${input.parentAuthor} -->`,
        `<!-- nocturna-reply-author: ${input.responder} -->`,
        "",
        input.message.trim()
      ].join("\n");

      const created = await ghPost(`/repos/${REPO}/issues/${ISSUE}/comments`, token, { body });

      return json({
        ok: true,
        comment_id: created.id,
        comment_url: created.html_url,
        parent_url: parentLink,
        message: "Resposta publicada. O workflow da Nocturna fará a ancoragem do novo nó."
      }, 201, origin);
    } catch (error) {
      const status = error.status && error.status >= 400 && error.status < 500 ? error.status : 500;
      return json({ ok: false, error: error.message || "Falha ao publicar resposta." }, status, origin);
    }
  }
};
