import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const code = (await readFile(new URL('../app/api/klaviyo/subscribe/route.js', import.meta.url), 'utf8'))
  .replace('import { NextResponse } from "next/server";', 'const NextResponse = { json: (body, options) => Response.json(body, options) };');
process.env.KLAVIYO_PRIVATE_API_KEY = 'test-only';
process.env.KLAVIYO_NEWSLETTER_LIST_ID = 'test-list';
const { POST } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const request = body => new Request('https://example.test/api/klaviyo/subscribe', {method: 'POST', body: JSON.stringify(body)});

test('explicit email opt-in waits for provider acceptance and honors the configured list', async () => {
  const original = global.fetch;
  let release, payload, endpoint;
  global.fetch = async (url, options) => {
    endpoint = url; payload = JSON.parse(options.body);
    return new Promise(resolve => { release = resolve; });
  };
  try {
    let done = false;
    const pending = POST(request({email: ' READER@example.test ', consent: true, source: 'journal'})).then(r => {done = true; return r;});
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(done, false);
    assert.match(endpoint, /profile-subscription-bulk-create-jobs/);
    assert.equal(payload.data.relationships.list.data.id, 'test-list');
    assert.equal(payload.data.attributes.profiles.data[0].attributes.email, 'reader@example.test');
    assert.equal(payload.data.attributes.profiles.data[0].attributes.subscriptions.email.marketing.consent, 'SUBSCRIBED');
    assert.equal(payload.data.attributes.historical_import, undefined);
    release(new Response(null, {status: 202}));
    assert.equal((await pending).status, 200);
  } finally { global.fetch = original; }
});

test('provider failures are not reported as successful signups', async () => {
  const original = global.fetch;
  global.fetch = async () => new Response(null, {status: 403});
  try { assert.equal((await POST(request({email:'reader@example.test',consent:true}))).status,503); }
  finally { global.fetch = original; }
});

test('malformed addresses are rejected before contacting the provider', async () => {
  for (const email of [null, {}, 'invalid', 'a@']) {
    assert.equal((await POST(request({email,consent:true}))).status,400);
  }
});
