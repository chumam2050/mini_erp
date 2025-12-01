# MiniERP Backend

Backend API server untuk aplikasi MiniERP dengan autentikasi JWT dan PostgreSQL database.

## Fitur

✅ RESTful API dengan Express.js  
✅ ORM dengan Sequelize  
✅ Database PostgreSQL  
✅ Autentikasi JWT (JSON Web Token)  
✅ Password hashing dengan bcrypt  
✅ Role-based access control (RBAC)  
✅ **Swagger/OpenAPI Documentation**  
✅ Validasi data  
✅ Error handling  

## Teknologi

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM untuk PostgreSQL
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Swagger/OpenAPI** - API Documentation
- **dotenv** - Environment variables

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

File `.env` sudah dikonfigurasi dengan nilai default:

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

**⚠️ PENTING:** Ganti `JWT_SECRET` dengan nilai yang aman di production!

### 3. Database Setup

Database PostgreSQL sudah dikonfigurasi di `docker-compose.yml` dengan kredensial:
- Database: `minierp`
- User: `user`
- Password: `password`
- Port: `5432`

### 4. Seed Database (Opsional)

Untuk mengisi database dengan data awal:

```bash
npm run seed
```

Ini akan membuat 4 user default:

| Email | Password | Role |
|-------|----------|------|
| ahmad.wijaya@minierp.com | password123 | Administrator |
| siti.nurhaliza@minierp.com | password123 | Manager |
| budi.santoso@minierp.com | password123 | Staff |
| dewi.lestari@minierp.com | password123 | Staff |

### 5. Start Server

Development mode (dengan nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

**📚 Swagger UI tersedia di:** `http://localhost:5000/api-docs`

## 📖 API Documentation

### Swagger UI (Recommended)

Untuk interactive API documentation, buka browser dan akses:

```
http://localhost:5000/api-docs
```

Swagger UI menyediakan:
- ✅ Interactive testing - Test semua endpoint langsung dari browser
- ✅ Request/Response examples - Lihat contoh lengkap untuk setiap endpoint
- ✅ Authentication - Login dan authorize langsung di UI
- ✅ Schema documentation - Detail tentang request/response structure
- ✅ Try it out - Execute API calls tanpa tools tambahan

**Panduan lengkap:** Lihat [SWAGGER.md](./SWAGGER.md)

## Struktur Folder

```
src/
├── config/
│   └── database.js         # Konfigurasi Sequelize & PostgreSQL
├── middleware/
│   └── auth.js             # JWT authentication & authorization middleware
├── models/
│   └── User.js             # User model dengan Sequelize
├── routes/
│   ├── api.js              # User management routes
│   └── auth.js             # Authentication routes
├── seeders/
│   └── seed.js             # Database seeder
└── server.js               # Main server file
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Daftar user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Ambil profil user (protected)
- `PUT /api/auth/me` - Update profil user (protected)
- `PUT /api/auth/change-password` - Ganti password (protected)

### User Management

- `GET /api/users` - Ambil semua user (protected)
- `GET /api/users/:id` - Ambil user berdasarkan ID (protected)
- `POST /api/users` - Buat user baru (Administrator only)
- `PUT /api/users/:id` - Update user (Administrator/Manager only)
- `DELETE /api/users/:id` - Hapus user (Administrator only)

### Health Check

- `GET /api/health` - Status server

Lihat dokumentasi lengkap di [API.md](./API.md) atau gunakan **[Swagger UI](http://localhost:5000/api-docs)** untuk interactive documentation.

## Role-Based Access Control

### Administrator
- Akses penuh ke semua endpoint
- Bisa membuat, update, dan hapus user
- Tidak bisa menghapus akun sendiri

### Manager
- Bisa melihat dan update user
- Tidak bisa membuat atau hapus user

### Staff
- Bisa melihat user
- Hanya bisa update profil sendiri

## Authentication Flow

1. **Register/Login** → Dapatkan JWT token
2. **Simpan token** di client (localStorage/cookie)
3. **Kirim token** di header untuk request yang protected:
   ```
   Authorization: Bearer <your_token_here>
   ```

## Testing dengan cURL

### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmad.wijaya@minierp.com","password":"password123"}'
```

Response akan berisi token:
```json
{
  "message": "Login successful",
  "user": {...},
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Akses Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Models

### User Model

```javascript
{
  id: INTEGER (Primary Key, Auto Increment),
  name: STRING(100),
  email: STRING(100) - Unique,
  password: STRING (Hashed),
  role: ENUM('Administrator', 'Manager', 'Staff'),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

## Security Features

- ✅ Password hashing dengan bcrypt (10 rounds)
- ✅ JWT token dengan expiration
- ✅ Password tidak pernah dikirim di response
- ✅ Role-based authorization
- ✅ Input validation
- ✅ SQL injection protection (Sequelize ORM)

## Error Handling

Server mengembalikan error dalam format JSON:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development Tips

1. **Database Reset**: Jalankan `npm run seed` untuk reset database
2. **Check Logs**: Server akan log semua request di console
3. **Environment**: Set `NODE_ENV=production` untuk production mode
4. **Database Sync**: Server otomatis sync model dengan `{ alter: true }`

## Troubleshooting

### Database Connection Failed
- Pastikan PostgreSQL container berjalan
- Check kredensial di `.env`
- Pastikan port 5432 tidak digunakan aplikasi lain

### JWT Token Invalid
- Token mungkin expired, login ulang
- Check `JWT_SECRET` di `.env`
- Pastikan format header: `Bearer <token>`

### Permission Denied
- Check role user Anda
- Beberapa endpoint hanya untuk Administrator/Manager

## Next Steps

Untuk mengintegrasikan dengan frontend, baca dokumentasi di:
- **[SWAGGER.md](./SWAGGER.md)** - Interactive Swagger UI guide
- **[API.md](./API.md)** - Complete API reference manual

Gunakan Swagger UI di `http://localhost:5000/api-docs` untuk testing dan eksplorasi API!
