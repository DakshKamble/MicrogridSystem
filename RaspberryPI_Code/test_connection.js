#!/usr/bin/env node

/**
 * Simple test script to verify FastAPI server connection
 * Run with: node test_connection.js
 */

const https = require('https');
const http = require('http');

const API_URL = 'http://localhost:8000/api/v1/node1/zone1';

console.log('🧪 Testing FastAPI server connection...');
console.log(`📡 Connecting to: ${API_URL}`);

// Function to test the API endpoint
function testAPI() {
    const url = new URL(API_URL);
    const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Dashboard-Test-Client/1.0'
        },
        timeout: 5000
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
        console.log('📋 Response Headers:', res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                if (data) {
                    const jsonData = JSON.parse(data);
                    console.log('📊 Response Data:');
                    console.log(JSON.stringify(jsonData, null, 2));
                    console.log('🎉 Connection successful! FastAPI server is working.');
                } else {
                    console.log('⚠️ Empty response received');
                }
            } catch (error) {
                console.log('❌ Error parsing JSON response:', error.message);
                console.log('📄 Raw response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Connection Error:', error.message);
        console.log('🔍 Possible issues:');
        console.log('   - FastAPI server is not running');
        console.log('   - Wrong IP address (using localhost since both services on same Pi)');
        console.log('   - Port 8000 is blocked or not accessible');
        console.log('   - Network connectivity issues');
        console.log('');
        console.log('🛠️ Troubleshooting steps:');
        console.log('   1. Check if FastAPI server is running on Raspberry Pi');
        console.log('   2. Verify IP address with: hostname -I (on Pi)');
        console.log('   3. Test from Pi directly: curl http://localhost:8000/api/v1/node1/zone1');
        console.log('   4. Check firewall settings');
    });

    req.on('timeout', () => {
        console.log('⏰ Request timeout - server is not responding');
        req.destroy();
    });

    req.end();
}

// Test status endpoint first
function testStatus() {
    const statusURL = 'http://localhost:8000/api/v1/status';
    console.log(`📊 Testing status endpoint: ${statusURL}`);
    
    const url = new URL(statusURL);
    const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        timeout: 5000
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Status endpoint: ${res.statusCode} ${res.statusMessage}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📊 Status Data:');
                console.log(JSON.stringify(jsonData, null, 2));
                
                // Now test the main endpoint
                console.log('\n🔄 Testing main data endpoint...');
                testAPI();
            } catch (error) {
                console.log('❌ Error parsing status response:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Status endpoint error:', error.message);
        console.log('🔄 Trying main endpoint anyway...');
        testAPI();
    });

    req.on('timeout', () => {
        console.log('⏰ Status endpoint timeout');
        req.destroy();
        testAPI();
    });

    req.end();
}

// Start testing
testStatus();
