import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'http://127.0.0.1:3030';

async function eventually(fn, { timeoutMs = 3500 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let last;
  while (Date.now() < deadline) {
    try {
      const result = await fn();
      if (result !== false) return result;
    } catch (error) { last = error; }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw last ?? new Error('Condition was not reached before timeout');
}

// Run sequentially because the server listens on a fixed port.
test('real local server: menu CRUD, validation and JSON file persistence', async () => {
  const folder = await mkdtemp(path.join(tmpdir(), 'chilly-api-'));
  let server;
  try {
    for (const directory of ['menu', 'welcome']) {
      await mkdir(path.join(folder, directory));
    }
    await copyFile(path.join(root, 'server.js'), path.join(folder, 'server.js'));
    await copyFile(path.join(root, 'menu', 'menu.json'), path.join(folder, 'menu', 'menu.json'));
    await copyFile(path.join(root, 'welcome', 'welcome.txt'), path.join(folder, 'welcome', 'welcome.txt'));

    server = spawn(process.execPath, ['server.js'], {
      cwd: folder, stdio: ['ignore', 'ignore', 'pipe'],
    });
    let stderr = '';
    server.stderr.on('data', chunk => { stderr += chunk.toString(); });

    await eventually(async () => {
      if (server.exitCode !== null) throw new Error('Server terminated early: ' + stderr);
      const response = await fetch(base + '/');
      return response.ok;
    });

    let response = await fetch(base + '/');
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Welcome to Chilly Delights/);

    response = await fetch(base + '/menu');
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(await response.json()));

    response = await fetch(base + '/menu/10233');
    assert.equal(response.status, 200);
    assert.equal((await response.json()).code, '10233');

    response = await fetch(base + '/menu/99999');
    assert.equal(response.status, 404);

    response = await fetch(base + '/menu?code=12&name=invalid', { method: 'POST' });
    assert.equal(response.status, 400);

    response = await fetch(base + '/menu?code=45678&name=Mango&price=4.50', { method: 'POST' });
    assert.equal(response.status, 200);
    await eventually(async () => {
      const file = JSON.parse(await readFile(path.join(folder, 'menu', 'menu.json'), 'utf8'));
      return file.some(item => item.code === '45678' && item.price === '4.50');
    });

    response = await fetch(base + '/menu?code=45678&name=Duplicate', { method: 'POST' });
    assert.equal(response.status, 400);

    response = await fetch(base + '/menu/45678');
    assert.equal(response.status, 200);
    assert.equal((await response.json()).name, 'Mango');

    response = await fetch(base + '/menu/45678?price=5.00', { method: 'PUT' });
    assert.equal(response.status, 200);
    await eventually(async () => {
      const file = JSON.parse(await readFile(path.join(folder, 'menu', 'menu.json'), 'utf8'));
      return file.some(item => item.code === '45678' && item.price === '5.00');
    });

    response = await fetch(base + '/menu/45678', { method: 'DELETE' });
    assert.equal(response.status, 200);
    await eventually(async () => {
      const file = JSON.parse(await readFile(path.join(folder, 'menu', 'menu.json'), 'utf8'));
      return !file.some(item => item.code === '45678');
    });

    response = await fetch(base + '/menu/45678');
    assert.equal(response.status, 404);

    response = await fetch(base + '/menu/45678', { method: 'DELETE' });
    assert.equal(response.status, 404);
  } finally {
    if (server && server.exitCode === null) {
      server.kill('SIGTERM');
      await new Promise(resolve => server.once('close', resolve));
    }
    await rm(folder, { recursive: true, force: true });
  }
});
