#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting ZIDIO Connect Development Servers...\n');

// Start backend server
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  console.log('🎨 Starting frontend server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit(0);
  });

  frontend.on('close', (code) => {
    console.log(`Frontend server exited with code ${code}`);
    backend.kill('SIGINT');
    process.exit(code);
  });

}, 2000);

backend.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
  process.exit(code);
});