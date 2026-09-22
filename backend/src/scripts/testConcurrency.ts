/**
 * T7.4 — Concurrent Registration Test
 *
 * Simulates N users all trying to register for the same competition simultaneously.
 * Verifies:
 *   1. registeredCount never exceeds totalSpots
 *   2. Successes match exact count decrement (no phantom increments)
 *   3. All failures are either 409 (conflict) or 429 (rate limited) — no 5xx
 *
 * Run: npx ts-node-dev --transpile-only src/scripts/testConcurrency.ts
 */
import 'dotenv/config';
import http from 'http';

const BASE_HOST = 'localhost';
const BASE_PORT = 5000;
const BASE_PATH = '/api/v1';
const CONCURRENT_USERS = 10;

function httpReq(
  method: string,
  path: string,
  body?: object,
  token?: string
): Promise<{ status: number; data: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const options: http.RequestOptions = {
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: BASE_PATH + path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk: Buffer) => { raw += chunk.toString(); });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode ?? 0, data: JSON.parse(raw) as Record<string, unknown> });
        } catch {
          resolve({ status: res.statusCode ?? 0, data: {} });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

interface AuthData { token: string }

async function createUser(i: number): Promise<AuthData> {
  const email = `conc_${Date.now()}_${i}@feedants.com`;
  const res = await httpReq('POST', '/auth/register', {
    name: `Concurrent ${i}`,
    email,
    password: 'Test1234',
  });
  const d = (res.data as { data?: { token?: string } }).data;
  return { token: d?.token ?? '' };
}

async function getComp(): Promise<{ id: string; available: number; total: number }> {
  const res = await httpReq('GET', '/competitions?status=active');
  const items = ((res.data as { data?: { items?: Record<string, unknown>[] } }).data?.items) ?? [];
  const c = items[0];
  if (!c) throw new Error('No active competition. Start the server first.');
  return {
    id: c['_id'] as string,
    available: (c['totalSpots'] as number) - (c['registeredCount'] as number),
    total: c['totalSpots'] as number,
  };
}

async function tryRegister(token: string, id: string): Promise<{ ok: boolean; status: number }> {
  const res = await httpReq('POST', `/competitions/${id}/register`, {}, token);
  return { ok: res.status === 201, status: res.status };
}

void (async () => {
  console.log(`\n${'='.repeat(55)}`);
  console.log('  T7.4 — CONCURRENT REGISTRATION TEST');
  console.log(`  ${CONCURRENT_USERS} users hitting register simultaneously`);
  console.log(`${'='.repeat(55)}\n`);

  // Create users
  console.log('Creating test users...');
  const users = await Promise.all(
    Array.from({ length: CONCURRENT_USERS }, (_, i) => createUser(i))
  );
  console.log(`✅ ${users.length} users ready\n`);

  // Snapshot BEFORE
  const before = await getComp();
  console.log(`Competition  : ${before.id}`);
  console.log(`Total spots  : ${before.total}`);
  console.log(`Available    : ${before.available}\n`);

  // Fire simultaneously
  console.log('Firing all requests at once...');
  const t0 = Date.now();
  const results = await Promise.all(users.map((u) => tryRegister(u.token, before.id)));
  console.log(`Done in ${Date.now() - t0}ms\n`);

  const succeeded = results.filter((r) => r.ok);
  // 409 = duplicate/full, 429 = rate limited — both are "safe" expected failures
  const badFailures  = results.filter((r) => !r.ok && r.status !== 409 && r.status !== 429);
  const statusCounts = results.reduce<Record<number, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log('Results by status:');
  for (const [code, count] of Object.entries(statusCounts)) {
    const meaning = code === '201' ? 'registered' : code === '409' ? 'conflict/full' : code === '429' ? 'rate limited' : 'error';
    console.log(`  HTTP ${code} (${meaning}): ${count}`);
  }

  // Snapshot AFTER
  const after = await getComp();
  const decrement = before.available - after.available;

  console.log(`\nAvailable before : ${before.available}`);
  console.log(`Available after  : ${after.available}`);
  console.log(`Decrement        : ${decrement}`);

  // Core assertions
  const assertions: [boolean, string][] = [
    [badFailures.length === 0,
      `No 5xx or unexpected errors (got: ${JSON.stringify(badFailures.map(r=>r.status))})`],
    [succeeded.length === decrement,
      `Successes (${succeeded.length}) === count decrement (${decrement}) — no phantom writes`],
    [succeeded.length <= before.available,
      `Did not overbook (${succeeded.length} ≤ ${before.available} available spots)`],
    [after.available >= 0,
      `Spots never negative (after: ${after.available})`],
  ];

  console.log('\nAssertions:');
  let allPass = true;
  for (const [pass, label] of assertions) {
    console.log(`  ${pass ? '✅' : '❌'} ${label}`);
    if (!pass) allPass = false;
  }

  console.log(`\n  Note: 429s are expected — rate limiter correctly blocked rapid same-IP requests`);
  console.log(`${'='.repeat(55)}`);
  console.log(`  ${allPass ? '✅ ALL ASSERTIONS PASSED' : '❌ SOME ASSERTIONS FAILED'}`);
  console.log(`${'='.repeat(55)}\n`);

  process.exit(allPass ? 0 : 1);
})();
