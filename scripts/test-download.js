#!/usr/bin/env node

// Simple test script to verify file download functionality
// Run with: node test-download.js <file-url>

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const testUrl = process.argv[2];

if (!testUrl) {
    console.log('Usage: node test-download.js <file-url>');
    console.log('Example: node test-download.js https://dsfqdmrkryjpglrsffhc.supabase.co/storage/v1/object/public/edupapers/papers/test.pdf');
    process.exit(1);
}

console.log('Testing file download from:', testUrl);

const downloadTest = (url) => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        const request = client.get(url, (response) => {
            console.log(`Response status: ${response.statusCode}`);
            console.log(`Response headers:`, response.headers);
            
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            let dataLength = 0;
            response.on('data', (chunk) => {
                dataLength += chunk.length;
            });
            
            response.on('end', () => {
                console.log(`Total data received: ${dataLength} bytes`);
                console.log(`Content-Type: ${response.headers['content-type']}`);
                resolve();
            });
        });
        
        request.on('error', (err) => {
            reject(err);
        });
        
        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
};

try {
    await downloadTest(testUrl);
    console.log('✅ Download test successful');
} catch (error) {
    console.error('❌ Download test failed:', error.message);
}
