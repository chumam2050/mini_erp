# MiniERP System

Sistem Enterprise Resource Planning (ERP) mini yang dibangun dengan teknologi modern menggunakan **Lerna monorepo**, **React + Vite** untuk frontend, dan **Node.js + Express** untuk backend.

## 🏗️ Struktur Proyek

```
minierp/
├── packages/
│   ├── frontend/          # React + Vite Application
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── package.json
│   └── backend/           # Express API Server
│       ├── src/
│       │   ├── server.js
│       │   └── routes/
│       │       └── api.js
│       ├── .env
│       └── package.json
├── lerna.json             # Lerna configuration
├── package.json           # Root package.json
└── README.md
```

## 🚀 Tech Stack

### Frontend
- **React 18** - Library UI modern
- **Vite 5** - Build tool yang sangat cepat dengan HMR
- **Axios** - HTTP client untuk API calls
- **CSS Custom Properties** - Design system yang konsisten

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework yang minimalis
- **CORS** - Cross-Origin Resource Sharing
- **Nodemon** - Auto-reload untuk development

### Monorepo Management
- **Lerna** - Tool untuk mengelola JavaScript projects dengan multiple packages
- **npm Workspaces** - Dependency management

## 📦 Installation

### Prerequisites
- Node.js (v18 atau lebih tinggi)
- npm (v9 atau lebih tinggi)

### Setup

1. **Clone atau navigate ke project directory**
   ```bash
   cd /workspace/minierp
   ```

2. **Install dependencies (root dan semua packages)**
   ```bash
   npm install
   ```
   
   Lerna v8 menggunakan npm workspaces, jadi `npm install` akan otomatis install dependencies untuk semua packages.

## 🎯 Development

### Menjalankan Frontend dan Backend Secara Bersamaan

```bash
npm run dev
```

Atau menggunakan Lerna langsung:
```bash
npx lerna run dev --parallel
```

Ini akan menjalankan:
- **Frontend** di http://localhost:5173
- **Backend** di http://localhost:5000

### Menjalankan Frontend Saja

```bash
npm run dev:frontend
```

### Menjalankan Backend Saja

```bash
npm run dev:backend
```

### Build Frontend untuk Production

```bash
npm run build
```

Atau:
```bash
npx lerna run build --scope=@minierp/frontend
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Response:
```json
{
  "status": "OK",
  "message": "Backend is running smoothly",
  "timestamp": "2025-12-01T13:53:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### Users

#### Get All Users
```
GET /api/users
```

#### Get User by ID
```
GET /api/users/:id
```

#### Create New User
```
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Staff"
}
```

#### Update User
```
PUT /api/users/:id
Content-Type: application/json

{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "Manager"
}
```

#### Delete User
```
DELETE /api/users/:id
```

## 🎨 Features

### Frontend
- ✅ Modern UI dengan design system yang konsisten
- ✅ Responsive design
- ✅ Smooth animations dan transitions
- ✅ API integration dengan Axios
- ✅ Health check status indicator
- ✅ Error handling yang baik
- ✅ Loading states
- ✅ Hot Module Replacement (HMR)

### Backend
- ✅ RESTful API architecture
- ✅ CORS enabled
- ✅ Request logging
- ✅ Error handling middleware
- ✅ Environment variables support
- ✅ Auto-reload dengan Nodemon
- ✅ CRUD operations untuk Users

### Monorepo
- ✅ Lerna untuk package management
- ✅ Independent versioning
- ✅ Shared dependencies hoisting
- ✅ Parallel script execution
- ✅ npm Workspaces integration

## 🔧 Configuration

### Frontend Proxy
Frontend dikonfigurasi untuk proxy API calls ke backend. Lihat `packages/frontend/vite.config.js`:

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    }
  }
}
```

### Backend Environment Variables
Edit `packages/backend/.env` untuk mengubah konfigurasi:

```env
PORT=5000
NODE_ENV=development
```

## 📝 Lerna Commands

### Install dependencies (menggunakan npm workspaces)
```bash
npm install
```

### Run script di semua packages
```bash
npx lerna run <script-name>
```

### Run script di semua packages secara parallel
```bash
npx lerna run <script-name> --parallel
```

### Run script di package tertentu
```bash
npx lerna run <script-name> --scope=@minierp/frontend
```

### Clean node_modules di semua packages
```bash
npx lerna clean
```

### List packages
```bash
npx lerna list
```

## 🐛 Troubleshooting

### Port sudah digunakan
Jika port 5000 atau 5173 sudah digunakan, ubah di:
- Backend: `packages/backend/.env`
- Frontend: `packages/frontend/vite.config.js`

### Dependencies tidak terinstall
Jalankan:
```bash
npx lerna clean -y
npm install
```

### CORS errors
Pastikan backend sudah running dan CORS sudah enabled di `packages/backend/src/server.js`

## 📚 Next Steps

Beberapa fitur yang bisa ditambahkan:
- [ ] Authentication & Authorization
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] State management (Redux/Zustand)
- [ ] Form validation
- [ ] Unit & Integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] API documentation (Swagger)

## 📄 License

MIT

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ using Vite, React, Express, and Lerna**
