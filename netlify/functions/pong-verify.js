'use strict';

const crypto = require('crypto');

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store, max-age=0',
  'x-content-type-options': 'nosniff'
};

const b64url = input => Buffer.from(input).toString('base64url');
const fromB64url = input => Buffer.from(input, 'base64url').toString('utf8');
const hmac = (secret, input) => crypto.createHmac('sha256', secret).update(input).digest('base64url');
const sha256 = input => crypto.createHash('sha256').update(input).digest('hex');
const safeEq = (a,b) => {
  const A=Buffer.from(String(a));
  const B=Buffer.from(String(b));
  return A.length===B.length && crypto.timingSafeEqual(A,B);
};
const response = (statusCode, payload) => ({ statusCode, headers: JSON_HEADERS, body: JSON.stringify(payload) });
const finite = n => Number.isFinite(n);

function getSecret(){
  const secret = process.env.PONG_VERIFY_SECRET || '';
  return secret.length >= 32 ? secret : '';
}

function requestFingerprint(event){
  const headers = event?.headers || {};
  const ua = String(headers['user-agent'] || headers['User-Agent'] || '').slice(0,512);
  const host = String(headers.host || headers.Host || '').toLowerCase().slice(0,255);
  return { ua:sha256(ua).slice(0,16), host };
}

function createSession(secret, event){
  const now = Date.now();
  const fp = requestFingerprint(event);
  const payload = {
    v: 1,
    id: crypto.randomBytes(12).toString('hex'),
    iat: now,
    exp: now + 12 * 60 * 1000,
    ua: fp.ua,
    host: fp.host
  };
  const encoded = b64url(JSON.stringify(payload));
  return `${encoded}.${hmac(secret, `pong-session:${encoded}`)}`;
}

function readSession(secret, token, event){
  if (typeof token !== 'string' || token.length > 800 || !token.includes('.')) return null;
  const [encoded, sig, ...rest] = token.split('.');
  if (!encoded || !sig || rest.length) return null;
  const expected = hmac(secret, `pong-session:${encoded}`);
  if (!safeEq(sig, expected)) return null;
  try {
    const payload = JSON.parse(fromB64url(encoded));
    const now = Date.now();
    if (payload?.v !== 1 || typeof payload.id !== 'string') return null;
    if (!finite(payload.iat) || !finite(payload.exp)) return null;
    if (payload.iat > now + 15_000 || payload.exp < now) return null;
    if (now - payload.iat > 12 * 60 * 1000) return null;
    const fp = requestFingerprint(event);
    if (typeof payload.ua !== 'string' || !safeEq(payload.ua, fp.ua)) return null;
    if (typeof payload.host !== 'string' || payload.host !== fp.host) return null;
    return payload;
  } catch (_) { return null; }
}

function issueProof(secret, sessionId, matchHash){
  const ts = Math.floor(Date.now()/1000).toString(36).toUpperCase();
  const sid = sessionId.slice(0,8).toUpperCase();
  const mh = matchHash.slice(0,8).toUpperCase();
  const payload = `${ts}.${sid}.${mh}`;
  const sig = hmac(secret, `pong-proof:${payload}`).replace(/[^A-Za-z0-9]/g,'').slice(0,12).toUpperCase();
  return `VJ-${ts}-${sid}-${mh}-${sig}`;
}

function verifyProof(secret, code){
  if (typeof code !== 'string' || code.length > 100) return false;
  const parts = code.toUpperCase().split('-');
  if (parts.length !== 5 || parts[0] !== 'VJ') return false;
  const [,ts,sid,mh,sig] = parts;
  if (!/^[0-9A-Z]+$/.test(ts) || !/^[0-9A-F]{8}$/.test(sid) || !/^[0-9A-F]{8}$/.test(mh) || !/^[0-9A-Z]{12}$/.test(sig)) return false;
  const payload = `${ts}.${sid}.${mh}`;
  const expected = hmac(secret, `pong-proof:${payload}`).replace(/[^A-Za-z0-9]/g,'').slice(0,12).toUpperCase();
  if (!safeEq(sig, expected)) return false;
  const issued = parseInt(ts,36) * 1000;
  if (!finite(issued)) return false;
  const age = Date.now() - issued;
  return age > -60_000 && age < 180 * 24 * 60 * 60 * 1000;
}

function validateTelemetry(body, session){
  if (!body || body.version !== 1) return {ok:false, reason:'bad-version'};
  const frames = Array.isArray(body.frames) ? body.frames : [];
  const points = Array.isArray(body.points) ? body.points : [];
  const final = body.final || {};

  if (frames.length < 20 || frames.length > 9000) return {ok:false, reason:'bad-frame-count'};
  if (points.length < 5 || points.length > 9) return {ok:false, reason:'bad-point-count'};
  if (final.playerScore !== 5 || !Number.isInteger(final.aiScore) || final.aiScore < 0 || final.aiScore > 4) {
    return {ok:false, reason:'not-player-win'};
  }

  let ps = 0, as = 0, lastPointT = -Infinity, playerPoints = 0;
  for (const point of points) {
    if (!point || !finite(point.t) || !finite(point.x) || !finite(point.y) || !finite(point.vx) || !finite(point.vy)) {
      return {ok:false, reason:'bad-point-data'};
    }
    if (point.t <= lastPointT || (lastPointT > -Infinity && point.t - lastPointT < 650)) {
      return {ok:false, reason:'impossible-point-timing'};
    }
    lastPointT = point.t;
    const playerWon = point.playerWon === true;
    if (playerWon) { ps++; playerPoints++; }
    else as++;
    if (point.playerScore !== ps || point.aiScore !== as) return {ok:false, reason:'score-sequence'};
    if (playerWon) {
      if (!(point.x > 229.2 && point.vx > 0)) return {ok:false, reason:'player-point-boundary'};
    } else {
      if (!(point.x < 4.8 && point.vx < 0)) return {ok:false, reason:'cpu-point-boundary'};
    }
    if (Math.abs(point.vx) > 170 || Math.abs(point.vy) > 180 || point.y < -8 || point.y > 211) {
      return {ok:false, reason:'point-physics-range'};
    }
  }
  if (ps !== 5 || as !== final.aiScore || playerPoints !== 5) return {ok:false, reason:'final-score-mismatch'};

  let prev = null;
  let monotonicFrames = 0;
  let nearPointFrames = 0;
  const pointTimes = points.map(p=>p.t);
  for (const frame of frames) {
    if (!frame || !finite(frame.t) || !finite(frame.x) || !finite(frame.y) || !finite(frame.vx) || !finite(frame.vy) || !finite(frame.py) || !finite(frame.ay)) {
      return {ok:false, reason:'bad-frame-data'};
    }
    if (frame.t < 0 || frame.x < -18 || frame.x > 252 || frame.y < -12 || frame.y > 215) return {ok:false, reason:'frame-bounds'};
    if (frame.py < 0 || frame.py > 190 || frame.ay < 0 || frame.ay > 190) return {ok:false, reason:'paddle-bounds'};
    if (Math.abs(frame.vx) > 170 || Math.abs(frame.vy) > 180) return {ok:false, reason:'velocity-bounds'};
    if (!Number.isInteger(frame.ps) || !Number.isInteger(frame.as) || frame.ps < 0 || frame.as < 0 || frame.ps > 5 || frame.as > 5) return {ok:false, reason:'frame-score'};

    if (prev) {
      if (frame.t <= prev.t) return {ok:false, reason:'frame-order'};
      const dt = (frame.t-prev.t)/1000;
      if (dt <= .35 && !prev.point && !frame.point && prev.ps === frame.ps && prev.as === frame.as) {
        const maxDx = 190*dt + 18;
        const maxDy = 190*dt + 18;
        if (Math.abs(frame.x-prev.x) > maxDx || Math.abs(frame.y-prev.y) > maxDy) return {ok:false, reason:'teleport'};
      }
      monotonicFrames++;
    }
    if (frame.point === true && pointTimes.some(t=>Math.abs(t-frame.t)<=40)) nearPointFrames++;
    prev = frame;
  }

  if (monotonicFrames < 19) return {ok:false, reason:'too-few-frames'};
  if (nearPointFrames < Math.min(points.length,5)) return {ok:false, reason:'missing-point-evidence'};
  if (lastPointT < 4500 || lastPointT > 10*60*1000) return {ok:false, reason:'match-duration'};
  if (prev && Math.abs(prev.t-lastPointT) > 1600) return {ok:false, reason:'stale-final-frame'};

  const serverElapsed = Date.now() - session.iat;
  if (serverElapsed < 4500 || serverElapsed > 12*60*1000) return {ok:false, reason:'server-duration'};

  const canonical = JSON.stringify({v:1,id:session.id,points,final,first:frames[0],last:frames[frames.length-1]});
  return {ok:true, matchHash:sha256(canonical)};
}

exports.handler = async event => {
  const secret = getSecret();
  if (!secret) return response(503, {ok:false, error:'verification-unconfigured'});

  if (event.httpMethod === 'GET') {
    const q = event.queryStringParameters || {};
    if (q.start === '1') return response(200, {ok:true, session:createSession(secret, event)});
    if (q.proof) return response(200, {ok:true, valid:verifyProof(secret, q.proof)});
    return response(400, {ok:false, error:'bad-request'});
  }

  if (event.httpMethod !== 'POST') return response(405, {ok:false, error:'method-not-allowed'});
  if ((event.body || '').length > 450000) return response(413, {ok:false, error:'payload-too-large'});

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (_) { return response(400, {ok:false, error:'invalid-json'}); }

  const session = readSession(secret, body.session, event);
  if (!session) return response(401, {ok:false, error:'invalid-session'});

  const checked = validateTelemetry(body, session);
  if (!checked.ok) return response(422, {ok:false, error:'invalid-match', reason:checked.reason});

  return response(200, {ok:true, verified:true, proof:issueProof(secret, session.id, checked.matchHash)});
};
