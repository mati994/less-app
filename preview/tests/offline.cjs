// Run with Node 18+ from any working directory.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

(async () => {
  const scope = 'https://test.example/preview/';
  const listeners = {};
  const cacheData = new Map();
  let network = 'online';
  let failCacheWrite = false;
  let claimed = false;
  let skipped = false;
  const key = request => new URL(typeof request === 'string' ? request : request.url, scope).href;
  const caches = {
    async keys() { return [...cacheData.keys()]; },
    async delete(name) { return cacheData.delete(name); },
    async open(name) {
      if (!cacheData.has(name)) cacheData.set(name, new Map());
      const entries = cacheData.get(name);
      return {
        async addAll(urls) {
          for (const url of urls) {
            const file = url === './' ? 'index.html' : url.split('?')[0];
            assert.ok(fs.existsSync(path.resolve(__dirname, '..', file)), url);
            entries.set(key(url), new Response('cached ' + url));
          }
        },
        async put(request, response) {
          if (failCacheWrite) throw new Error('Cache full');
          entries.set(key(request), response.clone());
        },
        async match(request) { return entries.get(key(request))?.clone(); }
      };
    }
  };
  const live = await caches.open('less-pwa-v-live-fixture');
  await live.put(scope + 'foreign.js', new Response('live namespace'));
  await caches.open('less-preview-old-fixture');
  const context = vm.createContext({
    URL, Response, caches,
    fetch: async () => {
      if (network === 'offline') throw new Error('No network');
      if (network === 'error') return new Response('Server error', { status: 503 });
      return new Response('network response');
    },
    self: {
      registration: { scope },
      skipWaiting() { skipped = true; },
      clients: { claim() { claimed = true; } },
      addEventListener(name, handler) { listeners[name] = handler; }
    }
  });
  const worker = fs.readFileSync(path.resolve(__dirname, '../service-worker.js'), 'utf8');
  vm.runInContext(worker, context);
  async function lifecycle(name) {
    let pending;
    listeners[name]({ waitUntil(promise) { pending = promise; } });
    await pending;
  }
  await lifecycle('install');
  await lifecycle('activate');
  assert.ok(skipped && claimed);
  assert.ok(cacheData.has('less-pwa-v-live-fixture'));
  assert.ok(!cacheData.has('less-preview-old-fixture'));
  const fetchEvent = (url, method = 'GET', mode = 'cors') => {
    let response;
    listeners.fetch({request:{url, method, mode}, respondWith(value){response=value}});
    return response;
  };
  assert.equal(fetchEvent('https://test.example/index.html'), undefined);
  assert.equal(fetchEvent('https://outside.example/preview/index.html'), undefined);
  assert.equal(fetchEvent(scope + 'index.html', 'POST'), undefined);
  assert.equal(await (await fetchEvent(scope + 'index.html')).text(), 'network response');
  network = 'offline';
  assert.equal(await (await fetchEvent(scope + 'index.html')).text(), 'network response');
  assert.equal(await (await fetchEvent(scope + 'unseen-route', 'GET', 'navigate')).text(), 'network response');
  assert.equal((await fetchEvent(scope + 'foreign.js')).type, 'error');
  assert.equal(await (await live.match(scope + 'foreign.js')).text(), 'live namespace');
  network = 'error';
  assert.equal(await (await fetchEvent(scope + 'index.html')).text(), 'network response');
  network = 'online';
  failCacheWrite = true;
  assert.equal(await (await fetchEvent(scope + 'new.js')).text(), 'network response');
  console.log('PASS: precache assets, cache update, live cache preservation, scope boundaries, offline fallback, HTTP errors, cache-write failure.');
})().catch(error => { console.error(error); process.exitCode = 1; });
