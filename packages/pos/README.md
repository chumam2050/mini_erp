# MiniERP POS

Point of Sales desktop application built with Electron.

## Features

- 🔐 Authentication with backend API
- 💰 Cashier interface for quick transactions
- 📦 Product browsing and search
- 🛒 Shopping cart management
- 💳 Payment processing with change calculation
- 📊 Transaction history (coming soon)
- 🖥️ Cross-platform desktop application

## Development

### Prerequisites

- Node.js 18+
- Backend API running on http://localhost:5000

### Installation

```bash
npm install
```

### Run Development

```bash
npm start
```

### Build

```bash
npm run build
```

## Usage

1. Start the backend server first
2. Launch the POS application
3. Login with your credentials
4. Start processing transactions

### Login Credentials

Use the same credentials as the backend:
- Administrator: ahmad.wijaya@minierp.com / password123
- Manager: siti.nurhaliza@minierp.com / password123
- Staff: budi.santoso@minierp.com / password123

## Tech Stack

- Electron
- Vanilla JavaScript
- CSS3
- Backend API integration

## Project Structure

```
pos/
├── main.js              # Main process
├── preload.js           # Preload script
├── renderer/
│   ├── index.html       # Main HTML
│   ├── styles/
│   │   └── main.css     # Styles
│   └── js/
│       └── app.js       # Application logic
└── package.json
```
