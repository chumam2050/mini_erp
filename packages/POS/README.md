# Mini ERP - Point of Sales (Electron + React + Vite)

Desktop Point of Sales application built with Electron, React, and Vite using electron-vite.

## Features

- 🛒 Barcode scanner support (manual input)
- 🛍️ Shopping cart management with item selection
- 💰 Multiple payment methods (Cash, Card, E-Wallet)
- 📊 Sales history tracking with persistent storage
- ⚙️ Configurable API settings
- 💾 Persistent data storage with electron-store
- ⚡ Hot Module Replacement (HMR) for fast development
- 🎨 Modern React-based UI with reusable components

## Technology Stack

- **Electron** ^28.0.0 - Cross-platform desktop framework
- **React** ^18.2.0 - UI library for component-based development
- **Vite** ^5.0.0 - Lightning-fast build tool
- **electron-vite** ^2.0.0 - Vite integration for Electron with HMR

## Prerequisites

- Node.js (v20.19+ or v22.12+)
- npm or yarn

## Installation

```bash
cd packages/POS
npm install
```

## Development

Run the application in development mode with Hot Module Replacement:

```bash
npm run dev
```

This will:
- Start Vite dev server for the renderer process
- Launch Electron with the app
- Enable hot reloading for instant feedback

### Preview Production Build

Test the production build before packaging:

```bash
npm start
```

## Building for Production

Build the application for distribution:

```bash
# Build source code and create distributable
npm run build

# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

The built application will be available in the `dist/` directory.

## Project Structure

```
packages/POS/
├── src/
│   ├── main/
│   │   └── index.js          # Main Electron process
│   ├── preload/
│   │   └── index.js          # Preload script (IPC bridge)
│   └── renderer/
│       └── src/
│           ├── main.jsx      # React entry point
│           ├── App.jsx       # Main App component
│           ├── index.css     # Global styles
│           ├── components/   # React components
│           └── index.html
├── electron.vite.config.js   # Vite configuration
├── assets/                   # Application icons
├── package.json             # Project configuration
├── README.md                # This file
└── MIGRATION.md             # Migration guide
```

## Configuration

The application stores configuration in the user's app data directory using `electron-store`.

### API Configuration

You can configure the backend API connection through the Settings menu (gear icon):

- **API Base URL**: The URL of your backend server (default: `http://localhost:3000`)
- **API Timeout**: Request timeout in milliseconds (default: `5000`)

## Integration with Backend

The POS application is designed to work with the Mini ERP backend API. To connect:

1. Ensure the backend server is running (see `packages/backend/README.md`)
2. Open Settings in the POS application
3. Set the API Base URL to your backend server URL
4. Save settings

## Data Storage

The application uses `electron-store` for persistent data storage:

- **Current Cart**: Saved automatically to preserve cart state between sessions
- **Sales History**: Stores completed sales locally
- **API Configuration**: Stores backend connection settings

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: New sale (clear cart)
- `Ctrl/Cmd + Q`: Quit application
- `F12`: Toggle Developer Tools

## Security

The application follows Electron security best practices:

- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication through preload script
- Content Security Policy enforced

## TODO

- [ ] Implement actual API integration with backend
- [ ] Add user authentication
- [ ] Implement receipt printing
- [ ] Add customer management
- [ ] Support barcode scanning
- [ ] Add offline mode with sync
- [ ] Implement discount codes
- [ ] Add sales reports
- [ ] Support multiple payment methods

## License

ISC
