#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🔍 ZIDIO Connect Application Verification\n');

async function checkBackend() {
  console.log('📡 Checking Backend Status...');
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log('✅ Backend: Online (Uptime: ' + Math.floor(data.uptime) + 's)');
      return true;
    } else {
      console.log('❌ Backend: Not responding properly');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend: Cannot connect (Make sure server is running on port 5000)');
    return false;
  }
}

async function checkDatabase() {
  console.log('🗄️  Checking Database Connection...');
  try {
    const response = await fetch('http://localhost:5000/api/jobs?limit=1');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Database: Connected and responding');
      return true;
    } else {
      console.log('❌ Database: Connection issues');
      return false;
    }
  } catch (error) {
    console.log('❌ Database: Cannot verify connection');
    return false;
  }
}

async function checkAuthentication() {
  console.log('🔐 Checking Authentication System...');
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.johnson@email.com',
        password: 'student123'
      })
    });
    const data = await response.json();
    
    if (data.success && data.token) {
      console.log('✅ Authentication: Working (Test login successful)');
      return true;
    } else {
      console.log('❌ Authentication: Login failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication: Service unavailable');
    return false;
  }
}

async function checkFrontend() {
  console.log('🎨 Checking Frontend Status...');
  try {
    const response = await fetch('http://localhost:8080');
    
    if (response.ok) {
      console.log('✅ Frontend: Running on port 8080');
      return true;
    } else {
      console.log('❌ Frontend: Not responding properly');
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend: Cannot connect (Make sure frontend is running on port 8080)');
    return false;
  }
}

async function runVerification() {
  console.log('Starting comprehensive application verification...\n');
  
  const checks = [
    { name: 'Backend API', check: checkBackend },
    { name: 'Database', check: checkDatabase },
    { name: 'Authentication', check: checkAuthentication },
    { name: 'Frontend', check: checkFrontend }
  ];
  
  let passed = 0;
  let total = checks.length;
  
  for (const { name, check } of checks) {
    const result = await check();
    if (result) passed++;
    console.log('');
  }
  
  console.log('📊 Verification Summary:');
  console.log(`✅ Passed: ${passed}/${total} checks`);
  
  if (passed === total) {
    console.log('🎉 All systems operational! Application is ready to use.');
    console.log('\n🚀 Access your application:');
    console.log('   Frontend: http://localhost:8080');
    console.log('   Backend API: http://localhost:5000');
    console.log('\n👥 Test Credentials:');
    console.log('   Student: sarah.johnson@email.com / student123');
    console.log('   Recruiter: hr@techcorp.com / recruiter123');
    console.log('   Admin: admin@zidio.com / admin123');
  } else {
    console.log('⚠️  Some systems are not working properly. Please check the issues above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Start backend: cd server && npm run dev');
    console.log('   3. Start frontend: npm run dev');
    console.log('   4. Check for any error messages in the terminals');
  }
}

// Only run if this file is executed directly
runVerification().catch(console.error);