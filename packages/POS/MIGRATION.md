# POS Application - Electron + Vite + React Migration

This POS application has been refactored to use **electron-vite** with **React** for improved development experience and performance.

## What Changed

### Project Structure
```
packages/POS/
├── src/
│   ├── main/
│   │   └── index.js          # Main process (Electron)
│   ├── preload/
│   │   └── index.js          # Preload script (IPC bridge)
│   └── renderer/
│       └── src/
│           ├── main.jsx      # React entry point
│           ├── App.jsx       # Main App component
│           ├── index.css     # Global styles
│           ├── components/   # React components
│           │   ├── Header.jsx
│           │   ├── CartItems.jsx
│           │   ├── ActionButtons.jsx
│           │   ├── Summary.jsx
│           │   └── SettingsModal.jsx
│           └── index.html
├── electron.vite.config.js   # Vite configuration
└── package.json
```

### Technology Stack
- **Electron** ^28.0.0
- **electron-vite** ^2.0.0 (Build tool with HMR)
- **React** ^18.2.0
- **Vite** ^5.0.0 (Fast bundler)

### Key Improvements
✅ **Hot Module Replacement (HMR)** - Instant UI updates without full reload
✅ **React Components** - Better code organization and reusability  
✅ **Fast Development** - Vite's lightning-fast dev server
✅ **Modern ES Modules** - Cleaner import/export syntax
✅ **Type Safety Ready** - Easy to add TypeScript support later

## Installation

```bash
cd packages/POS
npm install
```

## Development

Start the development server with HMR:

```bash
npm run dev
```

This will:
1. Start Vite dev server for the renderer process
2. Launch Electron with the app
3. Enable hot reloading for instant feedback

## Building for Production

Build the application:

```bash
npm run prebuild    # Build source code
npm run build       # Create distributable
```

Or build for specific platforms:

```bash
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```

## Project Configuration

### electron.vite.config.js
Main configuration file for electron-vite:
- **main**: Configuration for main process
- **preload**: Configuration for preload script
- **renderer**: Configuration for renderer process (React)

### Key Scripts
- `npm run dev` - Start development with HMR
- `npm start` - Preview production build
- `npm run prebuild` - Build for production
- `npm run build` - Package the application

## Migration Notes

### Old Structure (Vanilla JS)
- `src/main.js` → Main process
- `src/preload.js` → Preload script
- `src/renderer/` → Vanilla HTML/CSS/JS

### New Structure (React + Vite)
- `src/main/index.js` → Main process (ES modules)
- `src/preload/index.js` → Preload script (ES modules)
- `src/renderer/src/` → React components

### IPC Communication
The IPC API remains the same - `window.electronAPI` is still available with all the same methods:
- `storeGet(key)`
- `storeSet(key, value)`
- `storeDelete(key)`
- `getAppVersion()`
- `getApiConfig()`
- `setApiConfig(config)`
- `onMenuNewSale(callback)`
- `onMenuAbout(callback)`

## Features

All existing features are preserved:
- ✅ Barcode input with Enter key support
- ✅ Shopping cart management
- ✅ Item selection and quantity editing
- ✅ Multiple payment methods (Cash, Card, E-Wallet)
- ✅ PPN 11% tax calculation
- ✅ Real-time date/time display
- ✅ Persistent storage with electron-store
- ✅ Settings modal for API configuration

## Development Tips

### Hot Module Replacement
- Changes to React components update instantly
- No need to restart the app
- State is preserved during updates

### DevTools
- Press `F12` to open Chrome DevTools
- Use React DevTools extension for component inspection

### Debugging
- Main process: Use VSCode debugger or `console.log`
- Renderer process: Use Chrome DevTools

## Future Enhancements

Easy to add:
- TypeScript for type safety
- State management (Redux, Zustand)
- UI component libraries (shadcn/ui, Material-UI)
- Testing (Jest, React Testing Library)
- API integration with backend

## Troubleshooting

### Port Already in Use
If you get a port conflict, electron-vite will automatically try another port.

### Build Fails
Make sure all dependencies are installed:
```bash
npm install
```

### Hot Reload Not Working
Restart the dev server:
```bash
npm run dev
```

## Resources

- [electron-vite Documentation](https://electron-vite.org/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Electron Documentation](https://www.electronjs.org/docs/)

## License

ISC
