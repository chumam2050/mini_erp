import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from 'sonner'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="light" storageKey="minierp-theme">
            <BrowserRouter>
                <App />
                <Toaster position="top-right" richColors />
            </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>,
)
