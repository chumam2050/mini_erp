# Barcode Generation Scripts

Script untuk generate barcode PDF dari semua produk yang ada di database.

## 📋 Prerequisite

Pastikan sudah ada produk di database. Jika belum, jalankan seeder:

```bash
npm run seed
```

## 🚀 Cara Menggunakan

### Generate Semua Jenis Barcode

```bash
npm run generate:barcodes
```

Atau:

```bash
node src/scripts/generateAllBarcodes.js
```

Script ini akan generate:
- Individual PDFs (1 PDF per produk)
- Batch PDF (semua produk dalam 1 PDF)
- Label PDF (grid layout untuk print sticker)
- Category PDFs (1 PDF per kategori)

### Generate Individual Barcodes

Generate 1 PDF terpisah untuk setiap produk:

```bash
npm run generate:barcodes:individual
```

Output: `barcode-output/individual/barcode_PRODUCT_SKU.pdf`

### Generate Batch PDF

Generate 1 PDF yang berisi semua produk:

```bash
npm run generate:barcodes:batch
```

Output: `barcode-output/all_products_barcodes.pdf`

### Generate Label Sheet

Generate label dalam bentuk grid (untuk print sticker):

```bash
npm run generate:barcodes:labels
```

Atau dengan custom options:

```bash
node src/scripts/generateAllBarcodes.js labels 4 true
```

Parameter:
- `4` = jumlah label per baris (default: 3)
- `true` = tampilkan border (default: false)

Output: `barcode-output/barcode_labels.pdf`

### Generate by Category

Generate 1 PDF per kategori produk:

```bash
npm run generate:barcodes:category
```

Output: `barcode-output/by-category/barcodes_CATEGORY_NAME.pdf`

## 📂 Output Directory

Semua file PDF akan disimpan di:
```
/workspace/packages/backend/barcode-output/
├── individual/              # 1 PDF per produk
│   ├── barcode_SKU001.pdf
│   ├── barcode_SKU002.pdf
│   └── ...
├── by-category/            # 1 PDF per kategori
│   ├── barcodes_Electronics.pdf
│   ├── barcodes_Food.pdf
│   └── ...
├── all_products_barcodes.pdf  # Semua produk dalam 1 PDF
└── barcode_labels.pdf         # Label grid untuk print
```

## 🛠️ Help

Untuk melihat bantuan lengkap:

```bash
node src/scripts/generateAllBarcodes.js --help
```

## 📝 Notes

- Script akan otomatis membuat folder output jika belum ada
- Format barcode: Code128 (standard barcode format)
- PDF siap untuk di-print
- Label sheet cocok untuk print sticker barcode

## 🔧 Troubleshooting

**Error: Database connection failed**
- Pastikan database sudah running
- Check file `.env` untuk konfigurasi database

**No products found**
- Jalankan `npm run seed` untuk menambah data produk

**Permission denied**
- Pastikan folder `barcode-output` memiliki permission write
