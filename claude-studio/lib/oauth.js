// ---------------------------------------------------------------------------
// Claude "Login with Claude" OAuth (PKCE)
//
// This implements the same authorization-code + PKCE flow that Claude Code's
// `setup-token` uses. The user authorizes in their browser, Claude shows them
// a short authorization code, and they paste it back here. We exchange that
// code for an access token tied to *their* Claude subscription, then use it
// to run inference on their behalf — so AI usage is billed to their Pro/Max
// plan rather than to a shared API key.
// ---------------------------------------------------------------------------

const crypto = require('crypto');

const CONFIG = {
  clientId: process.env.CLAUDE_OAUTH_CLIENT_ID || '9d1c250a-e61b-44d9-88ed-5944d1962f5e',
  authorizeUrl: process.env.CLAUDE_OAUTH_AUTHORIZE_URL || 'https://claude.ai/oauth/authorize',
  tokenUrl: process.env.CLAUDE_OAUTH_TOKEN_URL || 'https://console.anthropic.com/v1/oauth/token',
  redirectUri: process.env.CLAUDE_OAUTH_REDIRECT_URI || 'https://console.anthropic.com/oauth/code/callback',
  scopes: process.env.CLAUDE_OAUTH_SCOPES || 'org:create_api_key user:profile user:inference',
};

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Generate a PKCE verifier/challenge pair plus an anti-forgery state value.
function createPkce() {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  const state = base64url(crypto.randomBytes(24));
  return { verifier, challenge, state };
}

// Build the URL the user visits to authorize the app.
function buildAuthorizeUrl({ challenge, state }) {
  const url = new URL(CONFIG.authorizeUrl);
  url.searchParams.set('code', 'true');
  url.searchParams.set('client_id', CONFIG.clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', CONFIG.redirectUri);
  url.searchParams.set('scope', CONFIG.scopes);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', state);
  return url.toString();
}

// The console callback shows the user a value shaped like `AUTHCODE#STATE`.
// Accept either that combined form or a bare code.
function parsePastedCode(pasted) {
  const trimmed = String(pasted || '').trim();
  const [code, state] = trimmed.split('#');
  return { code: (code || '').trim(), state: (state || '').trim() };
}

async function exchangeCode({ code, state, verifier }) {
  const res = await fetch(CONFIG.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: CONFIG.clientId,
      code,
      state,
      redirect_uri: CONFIG.redirectUri,
      code_verifier: verifier,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Token exchange failed (${res.status}): ${text.slice(0, 500)}`);
  }
  return normalizeTokenResponse(JSON.parse(text));
}

async function refreshToken(refresh) {
  const res = await fetch(CONFIG.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: CONFIG.clientId,
      refresh_token: refresh,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Token refresh failed (${res.status}): ${text.slice(0, 500)}`);
  }
  return normalizeTokenResponse(JSON.parse(text));
}

function normalizeTokenResponse(data) {
  const expiresInMs = (Number(data.expires_in) || 3600) * 1000;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    // Refresh a minute early to avoid racing expiry.
    expiresAt: Date.now() + expiresInMs - 60_000,
    scope: data.scope,
  };
}

module.exports = {
  CONFIG,
  createPkce,
  buildAuthorizeUrl,
  parsePastedCode,
  exchangeCode,
  refreshToken,
};
