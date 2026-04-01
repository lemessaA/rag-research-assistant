#!/usr/bin/env node
/**
 * Development server startup script for RAG Research Assistant Frontend
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting RAG Research Assistant Frontend (Development Mode)');
console.log('📁 Working directory:', process.cwd());
console.log('🔄 Hot reloading enabled');
console.log('🌐 Frontend will be available at: http://localhost:3000');
console.log();

// Check if .env.local file exists
const envFile = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envFile)) {
    console.log('⚠️  No .env.local file found. Copy .env.example to .env.local and configure:');
    console.log('   cp .env.example .env.local');
    console.log();
}

// Check if node_modules exists
const nodeModules = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModules)) {
    console.log('📦 Installing dependencies...');
    const install = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
    
    install.on('close', (code) => {
        if (code === 0) {
            startDevServer();
        } else {
            console.error('❌ Failed to install dependencies');
            process.exit(1);
        }
    });
} else {
    startDevServer();
}

function startDevServer() {
    console.log('🎯 Starting Next.js development server...');
    
    const nextDev = spawn('npm', ['run', 'dev'], { 
        stdio: 'inherit', 
        shell: true,
        env: {
            ...process.env,
            FORCE_COLOR: '1'
        }
    });

    nextDev.on('close', (code) => {
        if (code !== 0) {
            console.error(`❌ Development server exited with code ${code}`);
            process.exit(code);
        }
    });

    process.on('SIGINT', () => {
        console.log('\n👋 Frontend server stopped');
        nextDev.kill('SIGINT');
        process.exit(0);
    });
}