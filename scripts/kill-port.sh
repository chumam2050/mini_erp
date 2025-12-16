#!/bin/bash

# Script untuk terminate process yang menggunakan port tertentu
# Usage: ./scripts/kill-port.sh [port_number]
# Example: ./scripts/kill-port.sh 5000

PORT=$1

if [ -z "$PORT" ]; then
    echo "❌ Error: Port number tidak diberikan"
    echo "Usage: ./scripts/kill-port.sh [port_number]"
    echo "Example: ./scripts/kill-port.sh 5000"
    exit 1
fi

echo "🔍 Mencari process yang menggunakan port $PORT..."

# Cari PID yang menggunakan port tersebut
PID=$(netstat -tlnp 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1)

if [ -z "$PID" ]; then
    # Fallback: coba dengan fuser jika netstat tidak ada
    if command -v fuser &> /dev/null; then
        PID=$(fuser $PORT/tcp 2>/dev/null)
    fi
fi

if [ -z "$PID" ]; then
    echo "✅ Port $PORT tidak digunakan oleh process apapun"
    exit 0
fi

echo "⚠️  Process ditemukan dengan PID: $PID"
echo "🔪 Menghentikan process..."

kill -9 $PID 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Process berhasil dihentikan!"
    echo "   Port $PORT sekarang tersedia"
else
    echo "❌ Gagal menghentikan process"
    exit 1
fi
