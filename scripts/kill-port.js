#!/usr/bin/env node

/**
 * Script Node.js untuk terminate process yang menggunakan port tertentu
 * Usage: node scripts/kill-port.js [port_number]
 * Example: node scripts/kill-port.js 5000
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const port = process.argv[2];

if (!port) {
    console.error('❌ Error: Port number tidak diberikan');
    console.log('Usage: node scripts/kill-port.js [port_number]');
    console.log('Example: node scripts/kill-port.js 5000');
    process.exit(1);
}

async function killPort(portNumber) {
    try {
        console.log(`🔍 Mencari process yang menggunakan port ${portNumber}...`);

        // Coba dengan netstat
        let command = `netstat -tlnp 2>/dev/null | grep ":${portNumber} " | awk '{print $7}' | cut -d'/' -f1`;

        try {
            const { stdout } = await execAsync(command);
            const pid = stdout.trim();

            if (pid) {
                console.log(`⚠️  Process ditemukan dengan PID: ${pid}`);
                console.log('🔪 Menghentikan process...');

                await execAsync(`kill -9 ${pid}`);
                console.log('✅ Process berhasil dihentikan!');
                console.log(`   Port ${portNumber} sekarang tersedia`);
                return;
            }
        } catch (err) {
            // netstat mungkin tidak tersedia, coba fuser
            try {
                const { stdout } = await execAsync(`fuser ${portNumber}/tcp 2>/dev/null`);
                const pid = stdout.trim();

                if (pid) {
                    console.log(`⚠️  Process ditemukan dengan PID: ${pid}`);
                    console.log('🔪 Menghentikan process...');

                    await execAsync(`kill -9 ${pid}`);
                    console.log('✅ Process berhasil dihentikan!');
                    console.log(`   Port ${portNumber} sekarang tersedia`);
                    return;
                }
            } catch (fuserErr) {
                // Ignore fuser error
            }
        }

        console.log(`✅ Port ${portNumber} tidak digunakan oleh process apapun`);

    } catch (error) {
        console.error('❌ Gagal menghentikan process:', error.message);
        process.exit(1);
    }
}

killPort(port);
