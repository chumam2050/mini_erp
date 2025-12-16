#!/bin/bash

# Script untuk terminate semua development ports (5000 dan 5173)
# Usage: ./scripts/kill-dev-ports.sh

echo "🧹 Membersihkan development ports..."
echo ""

# Kill port 5000 (Backend)
echo "🔍 Checking port 5000 (Backend)..."
pkill -f "nodemon src/server.js" 2>/dev/null && echo "✅ Backend process dihentikan" || echo "ℹ️  Tidak ada backend process yang berjalan"

# Kill port 5173 (Frontend)
echo "🔍 Checking port 5173 (Frontend)..."
pkill -f "vite" 2>/dev/null && echo "✅ Frontend process dihentikan" || echo "ℹ️  Tidak ada frontend process yang berjalan"

echo ""
echo "✨ Selesai! Ports 5000 dan 5173 sekarang tersedia"
echo "💡 Anda bisa menjalankan: npm run dev"
