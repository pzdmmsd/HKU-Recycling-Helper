// Browser QA using Node 22+ and an installed Chrome; no npm dependencies or AI calls.
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.HKU_TEST_URL || 'http://127.0.0.1:8001';
const executable = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const artifacts = resolve('artifacts');
const profile = await mkdtemp(join(tmpdir(), 'hku-browser-'));
await mkdir(artifacts, { recursive: true });
const chrome = spawn(executable, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
let ws;
try {
  const address = await new Promise((resolveAddress, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error('Chrome did not start in 20 seconds')), 20000);
    chrome.on('error', reject);
    chrome.stderr.on('data', chunk => {
      output += chunk.toString();
      const match = output.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) { clearTimeout(timer); resolveAddress(match[1]); }
    });
  });
  ws = new WebSocket(address);
  await new Promise((resolveOpen, reject) => { ws.addEventListener('open', resolveOpen, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  let serial = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolveResult, reject, timer } = pending.get(message.id);
      clearTimeout(timer);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolveResult(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  });
  function call(method, params = {}, sessionId) {
    return new Promise((resolveResult, reject) => {
      const id = ++serial;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 20000);
      pending.set(id, { resolveResult, reject, timer });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
  const tab = (method, params) => call(method, params, sessionId);
  async function evaluate(expression) {
    const value = await tab('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (value.exceptionDetails) throw new Error(value.exceptionDetails.exception?.description || value.exceptionDetails.text);
    return value.result.value;
  }
  async function waitFor(expression) {
    const deadline = Date.now() + 12000;
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return;
      await new Promise(resolveWait => setTimeout(resolveWait, 100));
    }
    throw new Error(`UI condition timed out: ${expression}`);
  }
  async function click(selector) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  }
  async function screenshot(name) {
    await evaluate('window.scrollTo(0, 0)');
    const { cssContentSize } = await tab('Page.getLayoutMetrics');
    const result = await tab('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 } });
    await writeFile(join(artifacts, name), Buffer.from(result.data, 'base64'));
  }
  await tab('Runtime.enable');
  await tab('Page.enable');
  await tab('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await tab('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1040, deviceScaleFactor: 1, mobile: false });
  await tab('Page.navigate', { url: base });
  await waitFor('document.querySelectorAll("#sample-chips button").length === 4');
  const liveAvailable = await evaluate('fetch("/api/config").then(response => response.json()).then(config => config.live_available)');
  assert.equal(await evaluate('document.querySelector("#mode-live").disabled'), !liveAvailable);
  assert(await evaluate('document.querySelector("#description").readOnly'));
  assert(await evaluate('document.querySelector("#global-error").hidden'));
  await screenshot('desktop.png');
  for (const [id, expected] of [['sample-accepted', 'Accepted at the covered facility'], ['sample-not-accepted', 'Not accepted at the covered facility'], ['sample-uncertain', 'Cannot determine'], ['sample-refusal', 'Outside this helper’s scope']]) {
    await click(`[data-sample-id="${id}"]`);
    await click('#check-button');
    await waitFor(`!document.querySelector('#result-content').hidden && document.querySelector('#decision-heading').textContent === ${JSON.stringify(expected)} && !document.querySelector('#check-button').disabled`);
    assert(await evaluate('!document.querySelector("#sample-result-notice").hidden'));
    assert(await evaluate('document.querySelector("#check-error").hidden'));
  }
  await click('[data-sample-id="sample-accepted"]');
  await click('#check-button');
  await waitFor('!document.querySelector("#result-content").hidden && !document.querySelector("#check-button").disabled');
  await screenshot('desktop-result.png');
  assert(await evaluate('document.querySelector(".kicker-text").getBoundingClientRect().width > 100'));
  assert(await evaluate('document.querySelector("#facility-map-link").href.includes("wastereduction.hku.hk/re-facilities")'));
  await click('#lang-zh');
  assert.equal(await evaluate('document.documentElement.lang'), 'zh-HK');
  assert.equal(await evaluate('document.querySelector("#decision-heading").textContent'), '此回收點接收');
  assert(await evaluate('document.querySelector(".kicker-text").getBoundingClientRect().width > 80'));
  await click('#lang-en');
  assert.equal(await evaluate('document.documentElement.lang'), 'en');
  await click('#open-sources');
  await waitFor('document.querySelectorAll(".library-source").length === 18');
  assert(await evaluate('document.querySelector(".library-source").textContent.includes("Included in live corpus")'));
  await tab('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await tab('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await waitFor('!document.querySelector("#sources-dialog").open');
  await click('[data-open-dialog="how-dialog"]');
  assert(await evaluate('document.querySelector("#how-dialog").open'));
  await click('#how-dialog [data-close-dialog]');
  for (const path of ['/.env', '/static/../.env', '/data/rules.json']) {
    assert.equal(await evaluate(`fetch(${JSON.stringify(path)}).then(response => response.status)`), 404);
  }
  if (liveAvailable) {
    await click('#mode-live');
    await evaluate(`document.querySelector('#description').value='One empty clean plastic bottle.'; document.querySelector('#description').dispatchEvent(new Event('input',{bubbles:true})); window.fetch = async () => new Response(JSON.stringify({error:{code:'test_failure',message:'Synthetic service failure: no decision generated.'}}),{status:503,headers:{'Content-Type':'application/json'}})`);
    await click('#check-button');
    await waitFor('!document.querySelector("#check-error").hidden');
    assert(await evaluate('document.querySelector("#result-content").hidden'));
  }
  await tab('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  await tab('Page.reload', { ignoreCache: true });
  await waitFor('document.querySelectorAll("#sample-chips button").length === 4');
  assert(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'));
  await click('[data-sample-id="sample-accepted"]');
  await click('#check-button');
  await waitFor('!document.querySelector("#result-content").hidden && !document.querySelector("#check-button").disabled');
  assert(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'));
  await screenshot('mobile.png');
  await click('#dismiss-walkthrough');
  assert(await evaluate('document.querySelector("#walkthrough").hidden'));
  assert.deepEqual(errors, []);
  console.log(`Browser QA passed: four sample outcomes, source drawer, dialogs/Escape, private paths, desktop and mobile layout. Live error handling ${liveAvailable ? 'verified with a mock' : 'skipped (no server key)'}. No live AI calls.`);
  await call('Browser.close');
} finally {
  if (ws && ws.readyState === WebSocket.OPEN) ws.close();
  chrome.kill('SIGTERM');
  await new Promise(resolveWait => setTimeout(resolveWait, 500));
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}
