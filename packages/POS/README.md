# Mini ERP - Point of Sales (Electron)

Desktop Point of Sales application built with Electron.

## Features

- 🛒 Product catalog with search
- 🛍️ Shopping cart management
- 💰 Sales checkout with tax calculation
- 📊 Sales history tracking
- ⚙️ Configurable API settings
- 💾 Persistent data storage

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

```bash
cd packages/POS
npm install
```

## Development

Run the application in development mode:

```bash
npm run dev
```

Or using the standard start command:

```bash
npm start
```

## Building

Build the application for your platform:

```bash
# Build for current platform
npm run build

# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux

# Package without creating installers
npm run pack
```

The built application will be available in the `dist/` directory.

## Project Structure

```
packages/POS/
├── src/
│   ├── main.js           # Main Electron process
│   ├── preload.js        # Preload script for IPC
│   └── renderer/         # Renderer process (UI)
│       ├── index.html    # Main HTML file
│       ├── styles.css    # Application styles
│       └── renderer.js   # Frontend JavaScript
├── assets/               # Application icons
├── package.json          # Project configuration
└── README.md            # This file
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
