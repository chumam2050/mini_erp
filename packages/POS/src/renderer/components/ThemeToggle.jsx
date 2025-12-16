import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from './ui/button'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Check initial theme
    const html = document.documentElement
    setIsDark(html.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    if (isDark) {
      html.classList.remove('dark')
    } else {
      html.classList.add('dark')
    }
    setIsDark(!isDark)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}

export default ThemeToggle
