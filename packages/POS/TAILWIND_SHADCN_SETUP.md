# Setup Tailwind CSS dan shadcn/ui - Mini ERP POS

## ✅ Perubahan yang Sudah Dilakukan

### 1. **Instalasi Dependencies**

```bash
npm install -D tailwindcss @tailwindcss/postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge lucide-react
```

### 2. **Konfigurasi Tailwind CSS**

**tailwind.config.js**
- Content paths untuk semua file React/JSX
- Extended colors untuk shadcn/ui theme
- Custom border radius variables

**postcss.config.js**
- Menggunakan `@tailwindcss/postcss` (plugin terbaru)
- Autoprefixer untuk browser compatibility

**globals.css**
- Tailwind directives (@tailwind base, components, utilities)
- CSS variables untuk theming (HSL colors)
- Custom scrollbar styles
- Dark theme optimized untuk POS

### 3. **Utility Function**

**lib/utils.js**
- `cn()` function untuk merge Tailwind classes
- Menggunakan `clsx` dan `tailwind-merge`

### 4. **shadcn/ui Components**

Dibuat manual (tanpa CLI) dengan komponen:

#### **ui/button.jsx**
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: sm, default, lg, xl, icon
- Menggunakan `class-variance-authority` untuk type-safe variants

#### **ui/card.jsx**
- Card container
- CardHeader, CardTitle, CardContent, CardFooter
- Flexible dan composable

#### **ui/input.jsx**
- Styled input dengan focus states
- Border, shadow, dan ring effects
- Placeholder styling

### 5. **Update Semua Components**

#### **Header.jsx**
- Menggunakan Tailwind classes
- Button dari shadcn/ui
- Icons dari lucide-react
- Responsive layout dengan flexbox

#### **CartItems.jsx**
- Card component dari shadcn/ui
- Input component untuk barcode
- Button dengan icon Search
- Grid layout untuk cart items
- Selected state dengan bg-[#007bff]

#### **ActionButtons.jsx**
- Grid 3 kolom
- Button variants (outline dan destructive)
- Icons: Edit3, UserPlus, Trash2
- Flex column layout untuk icon + text

#### **Summary.jsx**
- Card dengan CardContent
- Button dengan custom colors (green, blue, yellow)
- Icons: Wallet, CreditCard, Smartphone
- Grid layout untuk payment buttons

#### **SettingsModal.jsx**
- Card component untuk modal
- Fixed positioning dengan backdrop
- Input dan Button components
- X icon untuk close

#### **App.jsx**
- Layout dengan Tailwind utility classes
- Flex dan Grid untuk responsive design
- Spacing dengan gap utilities

## 🎨 Theme & Styling

### Color Palette
```css
--background: 210 15% 20%     /* Dark gray untuk main bg */
--card: 210 15% 15%            /* Darker card bg */
--primary: 207 89% 43%         /* Blue untuk buttons */
--destructive: 0 84% 60%       /* Red untuk danger */
--muted: 210 10% 25%           /* Muted elements */
```

### Custom Colors
- Header: `#343a40` (dark gray)
- Selected item: `#007bff` (blue)
- Success button: `#28a745` (green)
- Warning button: `#ffc107` (yellow)
- Info button: `#17a2b8` (cyan)

## 🚀 Keunggulan

### 1. **Type-Safe Variants**
```jsx
<Button variant="destructive" size="lg">
  Delete
</Button>
```

### 2. **Composable Components**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### 3. **Icon Library**
```jsx
import { Settings, Search, Trash2 } from 'lucide-react'
<Settings className="h-5 w-5" />
```

### 4. **Utility-First CSS**
```jsx
<div className="flex items-center justify-between p-4 gap-3">
```

### 5. **Responsive Design**
```jsx
<div className="grid grid-cols-[1.5fr_1fr] gap-3">
```

## 📦 File Structure

```
src/renderer/src/
├── components/
│   ├── ui/
│   │   ├── button.jsx      # shadcn/ui Button
│   │   ├── card.jsx        # shadcn/ui Card
│   │   └── input.jsx       # shadcn/ui Input
│   ├── Header.jsx          # Updated dengan Tailwind
│   ├── CartItems.jsx       # Updated dengan Tailwind
│   ├── ActionButtons.jsx   # Updated dengan Tailwind
│   ├── Summary.jsx         # Updated dengan Tailwind
│   └── SettingsModal.jsx   # Updated dengan Tailwind
├── lib/
│   └── utils.js            # cn() utility
├── App.jsx                 # Updated layout
├── globals.css             # Tailwind + Custom CSS
└── main.jsx
```

## 🎯 Cara Menambah Component shadcn/ui Baru

### Manual Installation (Tanpa CLI)

1. **Buka shadcn/ui docs**: https://ui.shadcn.com/docs/components
2. **Copy component code** dari docs
3. **Paste ke** `src/renderer/src/components/ui/[component].jsx`
4. **Sesuaikan import path** untuk `cn` utility:
   ```jsx
   import { cn } from "../../lib/utils"
   ```
5. **Install dependencies** jika ada (biasanya sudah ter-install)

### Contoh: Menambah Dialog Component

```jsx
// src/renderer/src/components/ui/dialog.jsx
import * as React from "react"
import { cn } from "../../lib/utils"

const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  )
}

export { Dialog }
```

## 🔧 Troubleshooting

### Issue: PostCSS Error
**Solution**: Install `@tailwindcss/postcss`
```bash
npm install -D @tailwindcss/postcss
```

### Issue: Module Type Warning
**Solution**: Add `"type": "module"` to package.json
```json
{
  "type": "module"
}
```

### Issue: Tailwind Classes Not Working
**Solution**: Check `tailwind.config.js` content paths:
```js
content: [
  "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
]
```

## 📚 Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Lucide Icons**: https://lucide.dev
- **Class Variance Authority**: https://cva.style/docs

## ✨ Next Steps

Mudah untuk menambah:
- **Dialog/Modal** components
- **Toast notifications**
- **Dropdown menus**
- **Tabs** untuk navigation
- **Badge** untuk status indicators
- **Skeleton** loading states
- **Progress bars**
- **Forms dengan validation**

Semua bisa ditambahkan dengan copy-paste dari shadcn/ui docs!
