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
- **Sequelize** - ORM untuk PostgreSQL
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Token untuk authentication
- **bcryptjs** - Password hashing
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

### Quick Start (Recommended)

**📖 Lihat [QUICKSTART.md](./QUICKSTART.md) untuk panduan lengkap setup database dan authentication!**

1. **Seed Database (pertama kali)**
   ```bash
   cd packages/backend
   npm run seed
   ```

2. **Start Development Servers**
   ```bash
   cd /workspace
   npm run dev
   ```

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

### 🔓 Public Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Staff"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 🔒 Protected Endpoints (Require JWT Token)

#### Get Current Profile
```
GET /api/auth/me
Authorization: Bearer <your_token>
```

#### Get All Users
```
GET /api/users
Authorization: Bearer <your_token>
```

#### Create New User (Administrator only)
```
POST /api/users
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Staff"
}
```

**📚 Dokumentasi Lengkap:** Lihat [packages/backend/API.md](./packages/backend/API.md) untuk semua endpoints dan examples.

**📖 Swagger UI:** Akses interactive API documentation di `http://localhost:5000/api-docs` - Lihat [packages/backend/SWAGGER.md](./packages/backend/SWAGGER.md) untuk panduan lengkap.

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
- ✅ **Swagger/OpenAPI Documentation** - Interactive API docs
- ✅ **PostgreSQL database dengan Sequelize ORM**
- ✅ **JWT Authentication & Authorization**
- ✅ **Role-based Access Control (Admin, Manager, Staff)**
- ✅ **Password hashing dengan bcrypt**
- ✅ CORS enabled
- ✅ Request logging
- ✅ Error handling middleware
- ✅ Environment variables support
- ✅ Auto-reload dengan Nodemon
- ✅ CRUD operations untuk Users
- ✅ Database seeder untuk initial data

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

# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_NAME=minierp
DB_USER=user
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### Default Users (Setelah Seed)

| Email | Password | Role |
|-------|----------|------|
| ahmad.wijaya@minierp.com | password123 | Administrator |
| siti.nurhaliza@minierp.com | password123 | Manager |
| budi.santoso@minierp.com | password123 | Staff |
| dewi.lestari@minierp.com | password123 | Staff |

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

✅ **IMPLEMENTED:**
- ✅ Authentication & Authorization dengan JWT
- ✅ Database integration (PostgreSQL + Sequelize)
- ✅ Password hashing & security
- ✅ Role-based access control

🔜 **TODO:**
- [ ] Frontend: Integrate authentication UI
- [ ] State management (Redux/Zustand)
- [ ] Advanced form validation
- [ ] Unit & Integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] API documentation (Swagger)
- [ ] Refresh token mechanism
- [ ] Email verification
- [ ] Password reset flow

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide untuk setup & testing
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Detail implementasi ORM & JWT
- **[packages/backend/API.md](./packages/backend/API.md)** - Complete API reference
- **[packages/backend/README.md](./packages/backend/README.md)** - Backend setup guide

## 📄 License

MIT

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ using Vite, React, Express, and Lerna**
