#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up dev server resources...\n');

// Function to kill processes on a specific port (Windows)
function killProcessOnPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
    const lines = result.split('\n').filter((line) => line.includes('LISTENING'));

    if (lines.length === 0) {
      console.log(`✅ No processes found on port ${port}`);
      return;
    }

    const pids = new Set();
    lines.forEach((line) => {
      const match = line.match(/\s+(\d+)$/);
      if (match) {
        pids.add(match[1]);
      }
    });

    pids.forEach((pid) => {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`✅ Killed process ${pid} on port ${port}`);
      } catch {
        console.log(`⚠️  Could not kill process ${pid} (may already be terminated)`);
      }
    });
  } catch {
    console.log(`✅ No processes found on port ${port}`);
  }
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

// Stale Turbopack/dev artifacts cause ENOENT 500s after production builds.
const nextDir = path.join(process.cwd(), '.next');
const devDir = path.join(nextDir, 'dev');
removePath(devDir, 'Turbopack dev cache (.next/dev)');

// Kill processes on common dev ports
killProcessOnPort(3000);
killProcessOnPort(3001);

console.log('\n✨ Cleanup complete!\n');
