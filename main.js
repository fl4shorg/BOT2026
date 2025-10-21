#!/usr/bin/env node

/**
 * WhatsApp Bot - Main Entry Point
 * This file handles the bot startup with proper error handling and reconnection logic
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const dns = require('dns');

// Console colors for better output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logError(error) {
    console.error(`${colors.red}❌ ERROR: ${error.message}${colors.reset}`);
    if (process.env.DEBUG) {
        console.error(error.stack);
    }
}

function logInfo(message) {
    log(`${colors.blue}ℹ️  ${message}`, colors.blue);
}

function logSuccess(message) {
    log(`${colors.green}✅ ${message}`, colors.green);
}

function logWarning(message) {
    log(`${colors.yellow}⚠️  ${message}`, colors.yellow);
}

function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logInfo(`Created directory: ${dir}`);
    }
}

function validateDependencies() {
    const requiredDeps = [
        '@whiskeysockets/baileys',
        'axios',
        'fs',
        'path'
    ];
    
    const packageJson = require('./package.json');
    const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const dep of requiredDeps) {
        if (!installedDeps[dep] && dep !== 'fs' && dep !== 'path') {
            throw new Error(`Required dependency "${dep}" is not installed. Run: npm install ${dep}`);
        }
    }
    logSuccess('All dependencies validated');
}

async function startBot() {
    try {
        logInfo('Starting WhatsApp Bot...');
        
        // Validate environment
        validateDependencies();
        
        // Ajustes globais de rede para maior estabilidade
        try {
            // Keep-alive agressivo e limit de sockets
            const keepAliveAgentHttp = new http.Agent({ keepAlive: true, maxSockets: 50, keepAliveMsecs: 15000 });
            const keepAliveAgentHttps = new https.Agent({ keepAlive: true, maxSockets: 50, keepAliveMsecs: 15000 });
            // Força IPv4 quando possível para reduzir problemas de DNS/Happy Eyeballs (efetivo em runtime)
            try { dns.setDefaultResultOrder('ipv4first'); } catch (_) {}
            // Configura axios globalmente se presente
            try {
                const axios = require('axios');
                axios.defaults.timeout = 20000;
                axios.defaults.httpAgent = keepAliveAgentHttp;
                axios.defaults.httpsAgent = keepAliveAgentHttps;
                axios.defaults.headers.common['Connection'] = 'keep-alive';
            } catch (_) { /* axios pode não estar carregado aqui */ }
        } catch (netErr) {
            logWarning(`Não foi possível aplicar ajustes de rede: ${netErr.message}`);
        }

        // Ensure connection directory exists
        ensureDirectoryExists('./conexao');
        
        // Start the actual bot
        require('./connect.js');
        
    } catch (error) {
        logError(error);
        process.exit(1);
    }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
    logWarning('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logWarning('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logError(error);
    logError(new Error('Uncaught Exception - Bot will restart'));
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(new Error(`Unhandled Rejection at: ${promise}, reason: ${reason}`));
    logError(new Error('Unhandled Promise Rejection - Bot will restart'));
    process.exit(1);
});

// Start the bot
startBot();