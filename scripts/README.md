# Port Management Scripts

Kumpulan utility scripts untuk mengelola ports yang digunakan oleh development servers.

## 📁 Scripts Available

### 1. kill-port.sh
Bash script untuk terminate process yang menggunakan port tertentu.

**Usage:**
```bash
./scripts/kill-port.sh [port_number]
```

**Example:**
```bash
./scripts/kill-port.sh 5000
```

### 2. kill-dev-ports.sh
Bash script untuk terminate semua development ports (5000 dan 5173) sekaligus.

**Usage:**
```bash
./scripts/kill-dev-ports.sh
```

Atau menggunakan npm:
```bash
npm run kill-ports
```

### 3. kill-port.js
Node.js script untuk terminate process yang menggunakan port tertentu (cross-platform).

**Usage:**
```bash
node scripts/kill-port.js [port_number]
```

Atau menggunakan npm:
```bash
npm run kill-port [port_number]
```

**Example:**
```bash
npm run kill-port 5000
```

## 🚀 Quick Start

### Menghentikan semua development servers
```bash
npm run kill-ports
```

### Menghentikan port tertentu
```bash
npm run kill-port 5000
```

### Auto-cleanup sebelum dev (sudah dikonfigurasi)
```bash
npm run dev
```
Script `predev` akan otomatis menjalankan `kill-dev-ports.sh` sebelum memulai development servers.

## 🔧 Troubleshooting

### Error: "address already in use"
Jika Anda mendapat error ini saat menjalankan `npm run dev`:

1. **Quick fix:**
   ```bash
   npm run kill-ports
   npm run dev
   ```

2. **Manual fix untuk port tertentu:**
   ```bash
   npm run kill-port 5000  # untuk backend
   npm run kill-port 5173  # untuk frontend
   ```

### Script tidak executable
Jika script bash tidak bisa dijalankan:
```bash
chmod +x scripts/*.sh
```

## 📝 Notes

- Script `predev` akan otomatis dijalankan setiap kali Anda menjalankan `npm run dev`
- Tidak perlu khawatir tentang port yang sudah digunakan
- Scripts menggunakan `pkill` untuk mencari dan menghentikan process berdasarkan nama command
