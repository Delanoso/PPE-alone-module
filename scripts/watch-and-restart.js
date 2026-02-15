#!/usr/bin/env node
/**
 * Watchdog: checks localhost:5173 (dev server), ngrok API (4040), and the public tunnel URL.
 * Restarts dev or ngrok if they stop responding. Uses 2 consecutive failures before restart
 * to avoid flapping on transient issues.
 */
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as http from 'http';
import * as https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHECK_INTERVAL_MS = 30_000; // 30 seconds for faster recovery
const CONSECUTIVE_FAILURES_BEFORE_RESTART = 2;

let devProcess = null;
let ngrokProcess = null;
let devFailures = 0;
let ngrokFailures = 0;

function checkLocal(host, port, path = '/', timeoutMs = 5000) {
  return new Promise((resolve) => {
    const req = http.request(
      { host, port, path, method: 'HEAD', timeout: timeoutMs },
      (res) => resolve(res.statusCode < 500)
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

/** Check if the public ngrok tunnel URL actually responds (tunnel alive, not just process). */
function checkTunnelUrl(url, timeoutMs = 10000) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const lib = parsed.protocol === 'https:' ? https : http;
      const req = lib.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
          path: parsed.pathname || '/',
          method: 'HEAD',
          timeout: timeoutMs,
          headers: { 'ngrok-skip-browser-warning': 'true' },
        },
        (res) => resolve(res.statusCode < 500)
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.end();
    } catch (_) {
      resolve(false);
    }
  });
}

/** Get first tunnel public URL from ngrok local API (GET http://127.0.0.1:4040/api/tunnels). */
function getTunnelPublicUrl() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:4040/api/tunnels', { timeout: 5000 }, (res) => {
      let body = '';
      res.on('data', (ch) => (body += ch));
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          const tunnel = data?.tunnels?.[0];
          resolve(tunnel?.public_url || null);
        } catch (_) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function startDev() {
  if (devProcess) {
    try { devProcess.kill('SIGTERM'); } catch (_) {}
    devProcess = null;
  }
  spawnSync('npx', ['--yes', 'kill-port', '3001', '5173'], { cwd: ROOT, shell: true, stdio: 'ignore' });
  console.log('[watchdog] Starting dev server...');
  devProcess = spawn('npm', ['run', 'dev'], {
    cwd: ROOT,
    shell: true,
    stdio: 'inherit',
  });
  devProcess.on('exit', (code) => {
    if (devProcess) console.log(`[watchdog] Dev server exited (code ${code})`);
    devProcess = null;
  });
}

function startNgrok() {
  if (ngrokProcess) {
    try { ngrokProcess.kill('SIGTERM'); } catch (_) {}
    ngrokProcess = null;
  }
  spawnSync('npx', ['--yes', 'kill-port', '4040'], { cwd: ROOT, shell: true, stdio: 'ignore' });
  console.log('[watchdog] Starting ngrok...');
  ngrokProcess = spawn('npm', ['run', 'ngrok'], {
    cwd: ROOT,
    shell: true,
    stdio: 'inherit',
  });
  ngrokProcess.on('exit', (code) => {
    if (ngrokProcess) console.log(`[watchdog] Ngrok exited (code ${code})`);
    ngrokProcess = null;
  });
}

async function runCheck() {
  const devOk = await checkLocal('127.0.0.1', 5173);
  const ngrokApiOk = await checkLocal('127.0.0.1', 4040);

  // Dev server: restart after N consecutive failures
  if (!devOk) {
    devFailures++;
    if (devFailures >= CONSECUTIVE_FAILURES_BEFORE_RESTART) {
      console.log('[watchdog] Dev server (5173) not responding — restarting...');
      startDev();
      devFailures = 0;
    } else {
      console.log(`[watchdog] Dev server (5173) check failed (${devFailures}/${CONSECUTIVE_FAILURES_BEFORE_RESTART})`);
    }
  } else {
    devFailures = 0;
  }

  // Ngrok: consider both API (process) and public tunnel URL
  let ngrokOk = ngrokApiOk;
  if (ngrokApiOk) {
    const publicUrl = await getTunnelPublicUrl();
    if (publicUrl) {
      const tunnelOk = await checkTunnelUrl(publicUrl);
      if (!tunnelOk) {
        ngrokOk = false;
        console.log('[watchdog] Ngrok tunnel URL not responding — will restart if repeated');
      }
    }
  }

  if (!ngrokOk) {
    ngrokFailures++;
    if (ngrokFailures >= CONSECUTIVE_FAILURES_BEFORE_RESTART) {
      console.log('[watchdog] Ngrok not responding (API or tunnel) — restarting...');
      startNgrok();
      ngrokFailures = 0;
    } else {
      console.log(`[watchdog] Ngrok check failed (${ngrokFailures}/${CONSECUTIVE_FAILURES_BEFORE_RESTART})`);
    }
  } else {
    ngrokFailures = 0;
  }
}

async function loop() {
  // Give processes time to start on first run
  await new Promise((r) => setTimeout(r, 15_000));
  while (true) {
    await runCheck();
    await new Promise((r) => setTimeout(r, CHECK_INTERVAL_MS));
  }
}

// Start everything
console.log('[watchdog] Starting dev server and ngrok. Will check every 30s (dev + ngrok API + tunnel URL); restart after 2 consecutive failures.');
startDev();
setTimeout(() => startNgrok(), 8000); // Start ngrok after dev has time to come up
loop().catch((err) => {
  console.error('[watchdog] Error:', err);
  process.exit(1);
});
