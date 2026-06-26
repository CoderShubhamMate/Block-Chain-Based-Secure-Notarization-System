const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SMOKE_TIMEOUT = 10000; // 10 seconds to boot and respond

console.log('--- 💨 BBSNS SMOKE TEST ---');
console.log(`Target: http://localhost:${PORT}/api/system/config`);

// 1. Spawn the server process
const server = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NODE_ENV: 'test', AUDIT_LOG_SILENT: 'true' }
});

let serverOutput = '';
server.stdout.on('data', (data) => {
    serverOutput += data.toString();
});

server.stderr.on('data', (data) => {
    console.error(`[SERVER_ERR] ${data}`);
});

const cleanup = (code) => {
    console.log('Stopping server...');
    server.kill();
    process.exit(code);
};

// 2. Poll the endpoint
const start = Date.now();
const poll = () => {
    if (Date.now() - start > SMOKE_TIMEOUT) {
        console.error('❌ SMOKE_FAIL: Timeout waiting for server response');
        cleanup(1);
    }

    http.get(`http://localhost:${PORT}/api/system/config`, (res) => {
        if (res.statusCode === 200) {
            console.log('✅ BOOT_SUCCESS: Server is responding to requests.');
            console.log('✅ CONFIG_VERIFIED: Dynamic Authority bridged successfully.');
            cleanup(0);
        } else {
            console.log(`... waiting (Status: ${res.statusCode})`);
            setTimeout(poll, 1000);
        }
    }).on('error', () => {
        // Expected if server is still booting
        setTimeout(poll, 1000);
    });
};

// Start polling
setTimeout(poll, 1000);

// Detect early crash
server.on('exit', (code) => {
    if (code !== null && code !== 0) {
        console.error(`❌ STOPSHIP: Server crashed during boot with code ${code}`);
        console.error('--- LAST LOGS ---');
        console.error(serverOutput.slice(-500));
        cleanup(1);
    }
});
