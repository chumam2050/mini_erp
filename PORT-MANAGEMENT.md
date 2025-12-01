# 🔧 Port Management Scripts - Quick Reference

## ✅ Scripts Tersedia

Saya telah membuat 3 utility scripts untuk mengelola ports:

### 1. **npm run kill-ports** (Recommended)
Menghentikan semua development servers (port 5000 dan 5173)
```bash
npm run kill-ports
```

### 2. **npm run kill-port [port]**
Menghentikan process di port tertentu
```bash
npm run kill-port 5000
npm run kill-port 5173
```

### 3. **Auto-cleanup (predev)**
Otomatis membersihkan ports sebelum `npm run dev`
```bash
npm run dev  # Akan otomatis kill ports terlebih dahulu
```

## 🚀 Cara Penggunaan

### Skenario 1: Error "address already in use"
```bash
npm run kill-ports
npm run dev
```

### Skenario 2: Kill port tertentu saja
```bash
npm run kill-port 5000  # Backend
npm run kill-port 5173  # Frontend
```

### Skenario 3: Normal development (sudah auto-cleanup)
```bash
npm run dev  # Script predev akan otomatis membersihkan ports
```

## 📁 File Locations

- `/workspace/scripts/kill-port.sh` - Bash script untuk kill port tertentu
- `/workspace/scripts/kill-dev-ports.sh` - Bash script untuk kill semua dev ports
- `/workspace/scripts/kill-port.js` - Node.js script (cross-platform)
- `/workspace/scripts/README.md` - Dokumentasi lengkap

## 💡 Tips

1. **Tidak perlu khawatir lagi** tentang port yang sudah digunakan
2. **Script predev** sudah dikonfigurasi untuk auto-cleanup
3. Semua scripts sudah **executable** dan siap digunakan
4. Gunakan `npm run kill-ports` untuk quick fix

---

**Dokumentasi lengkap:** Lihat `/workspace/scripts/README.md`
