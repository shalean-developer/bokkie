#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up dev server resources...\n');

function getPidsOnPort(port) {
  const pids = new Set();

  if (process.platform === 'win32') {
    try {
      const psResult = execSync(
        `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique) -join ','"`,
        { encoding: 'utf-8' }
      ).trim();

      if (psResult) {
        psResult.split(',').forEach((pid) => {
          const trimmed = pid.trim();
          if (trimmed && trimmed !== '0') {
            pids.add(trimmed);
          }
        });
      }
    } catch {
      // Fall back to netstat below.
    }
  }

  if (pids.size === 0) {
    try {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
      result
        .split('\n')
        .filter((line) => line.includes('LISTENING'))
        .forEach((line) => {
          const match = line.match(/\s+(\d+)\s*$/);
          if (match) {
            pids.add(match[1]);
          }
        });
    } catch {
      // No listeners on this port.
    }
  }

  return pids;
}

function killProcessOnPort(port) {
  const pids = getPidsOnPort(port);

  if (pids.size === 0) {
    console.log(`✅ No processes found on port ${port}`);
    return;
  }

  pids.forEach((pid) => {
    try {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      console.log(`✅ Killed process ${pid} on port ${port}`);
    } catch {
      console.log(`⚠️  Could not kill process ${pid} (may already be terminated)`);
    }
  });
}

function removePath(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    console.log(`✅ No ${label} found`);
    return;
  }

  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
    console.log(`✅ Removed ${label}`);
  } catch (error) {
    console.log(`⚠️  Could not remove ${label}: ${error.message}`);
  }
}

// Stop dev servers before clearing Turbopack cache. Deleting .next/dev while
// a server is still running causes "Cannot find module [turbopack]_runtime.js".
killProcessOnPort(3000);
killProcessOnPort(3001);
killProcessOnPort(3002);

// Stale Turbopack/dev artifacts cause ENOENT 500s after production builds.
const nextDir = path.join(process.cwd(), '.next');
const devDir = path.join(nextDir, 'dev');
removePath(devDir, 'Turbopack dev cache (.next/dev)');

console.log('\n✨ Cleanup complete!\n');
