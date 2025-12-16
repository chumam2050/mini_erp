# Components

## Navbar

Responsive navigation bar component dengan fitur:

### Features
- **Responsive Design**: Tampilan berbeda untuk desktop dan mobile
- **Desktop Navigation**: Menu horizontal dengan navigasi terlihat
- **Mobile Menu**: Hamburger menu dengan slide-out drawer
- **User Profile**: Dropdown menu untuk profile dan settings
- **Theme Toggle**: Dark/Light mode toggle terintegrasi
- **Active Route Highlighting**: Menunjukkan halaman aktif

### Desktop Features (md breakpoint ke atas)
- Logo dan brand name
- Navigation links (Dashboard, Products, Users)
- Theme toggle button
- User dropdown menu dengan:
  - User info (nama dan email)
  - Profile link
  - Settings link
  - Logout button

### Mobile Features (di bawah md breakpoint)
- Compact logo
- Theme toggle
- Hamburger menu button
- Slide-out sheet dengan:
  - User avatar dan info
  - Navigation buttons
  - Profile dan Settings links
  - Logout button

### Usage
```jsx
import Navbar from '@/components/Navbar'

function YourPage() {
  return (
    <div>
      <Navbar />
      {/* Your page content */}
    </div>
  )
}
```

### Navigation Items
Edit `navItems` array di `Navbar.jsx` untuk menambah/mengubah menu:
```jsx
const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Users', path: '/users', icon: Users },
]
```

### Dependencies
- React Router (untuk navigasi)
- Lucide React (untuk icons)
- UI Components:
  - Button
  - Avatar
  - Sheet (mobile menu)
  - DropdownMenu (user menu)
  - Separator
  - ThemeToggle

### Responsive Breakpoints
- **Mobile**: < 768px (md breakpoint)
- **Desktop**: ≥ 768px (md breakpoint)
