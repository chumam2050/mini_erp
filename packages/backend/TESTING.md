# Unit Testing Guide - MiniERP Backend

## 📦 Testing Stack

- **Jest** - Testing framework
- **Supertest** - HTTP assertions
- **@jest/globals** - Jest globals untuk ES modules

## 🚀 Menjalankan Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## 📋 Test Suites

### 1. Authentication Tests (`auth.test.js`)

Tests untuk authentication endpoints:

**POST /api/auth/register**
- ✅ Register user baru successfully
- ✅ Fail dengan missing required fields
- ✅ Fail dengan duplicate email
- ✅ Fail dengan invalid email format
- ✅ Fail dengan password < 6 characters

**POST /api/auth/login**
- ✅ Login successfully dengan correct credentials
- ✅ Fail dengan incorrect password
- ✅ Fail dengan non-existent email
- ✅ Fail dengan missing credentials

**GET /api/auth/me**
- ✅ Get profile dengan valid token
- ✅ Fail tanpa token
- ✅ Fail dengan invalid token

**PUT /api/auth/me**
- ✅ Update profile successfully
- ✅ Fail dengan duplicate email
- ✅ Fail tanpa authentication

**PUT /api/auth/change-password**
- ✅ Change password successfully
- ✅ Fail dengan incorrect current password
- ✅ Fail dengan missing fields
- ✅ Fail dengan password < 6 characters

### 2. Users API Tests (`users.test.js`)

Tests untuk user management dengan role-based access:

**GET /api/users**
- ✅ Get all users as Admin
- ✅ Get all users as Manager
- ✅ Get all users as Staff
- ✅ Fail tanpa authentication

**GET /api/users/:id**
- ✅ Get user by ID dengan valid token
- ✅ Return 404 untuk non-existent user
- ✅ Fail tanpa authentication

**POST /api/users**
- ✅ Create user as Administrator
- ✅ Fail as Manager (403 Forbidden)
- ✅ Fail as Staff (403 Forbidden)
- ✅ Fail dengan missing fields
- ✅ Fail dengan duplicate email

**PUT /api/users/:id**
- ✅ Update user as Administrator
- ✅ Update user as Manager
- ✅ Fail as Staff (403 Forbidden)
- ✅ Return 404 untuk non-existent user

**DELETE /api/users/:id**
- ✅ Delete user as Administrator
- ✅ Fail as Manager (403 Forbidden)
- ✅ Fail as Staff (403 Forbidden)
- ✅ Fail to delete own account
- ✅ Return 404 untuk non-existent user

### 3. Health Check Tests (`health.test.js`)

Tests untuk health check dan general endpoints:

**GET /api/health**
- ✅ Return health status
- ✅ Return valid timestamp
- ✅ Return positive uptime

**GET /**
- ✅ Return API information
- ✅ Include Swagger documentation links

**GET /api-docs.json**
- ✅ Return Swagger JSON specification
- ✅ Have correct OpenAPI version

**404 Handler**
- ✅ Return 404 untuk non-existent routes

### 4. Model Tests (`models.test.js`)

Tests untuk User model:

**User Creation**
- ✅ Create user dengan hashed password
- ✅ Set default role to Staff
- ✅ Fail dengan invalid email
- ✅ Fail dengan duplicate email
- ✅ Fail dengan short password
- ✅ Fail dengan missing required fields

**Password Hashing**
- ✅ Hash password on create
- ✅ Hash password on update

**Password Comparison**
- ✅ Compare password correctly

**toJSON Method**
- ✅ Not include password in JSON output

**Role Validation**
- ✅ Accept all valid roles

**Timestamps**
- ✅ Have createdAt and updatedAt
- ✅ Update updatedAt on modification

## 📊 Test Coverage

Untuk melihat coverage report:

```bash
npm run test:coverage
```

Coverage report akan tersedia di:
- Terminal output (text)
- `coverage/lcov-report/index.html` (HTML)

Target coverage:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## 🗂️ Test File Structure

```
packages/backend/
├── __tests__/
│   ├── auth.test.js        # Authentication tests
│   ├── users.test.js       # User management tests
│   ├── health.test.js      # Health check tests
│   └── models.test.js      # Model tests
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Test setup
└── package.json
```

## ⚙️ Configuration

### jest.config.js

```javascript
{
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/seeders/**',
    '!src/config/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  forceExit: true
}
```

### jest.setup.js

Setup environment variables untuk testing:
- NODE_ENV=test
- JWT_SECRET=test-secret
- Database config untuk test

## 🎯 Best Practices

### 1. Test Isolation
Setiap test suite menggunakan database terpisah dan dibersihkan setelah selesai:
```javascript
beforeAll(async () => {
    await sequelize.sync({ force: true })
})

afterAll(async () => {
    await sequelize.close()
})
```

### 2. Descriptive Test Names
```javascript
test('should fail with password less than 6 characters', async () => {
    // Test implementation
})
```

### 3. Comprehensive Assertions
```javascript
expect(response.status).toBe(200)
expect(response.body).toHaveProperty('token')
expect(response.body.user).not.toHaveProperty('password')
```

### 4. Test Both Success and Failure Cases
- Happy path (successful operations)
- Error cases (validation errors, unauthorized access)
- Edge cases (missing data, invalid formats)

## 🐛 Troubleshooting

### Database Connection Issues

Jika test gagal karena database connection:

```bash
# Pastikan PostgreSQL running
docker ps | grep postgres

# Atau gunakan in-memory database untuk testing
# Update jest.setup.js untuk gunakan SQLite
```

### Port Already in Use

Jika port 5001 sudah digunakan:

```bash
# Edit jest.setup.js dan ganti PORT
process.env.PORT = 5002
```

### Jest Hanging

Jika Jest tidak selesai:

```bash
# Gunakan --forceExit flag
npm test -- --forceExit

# Atau update package.json script sudah include --forceExit
```

### Clear Jest Cache

Jika ada masalah caching:

```bash
npx jest --clearCache
```

## 📈 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: minierp_test
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd packages/backend && npm install
      - run: cd packages/backend && npm test
      - run: cd packages/backend && npm run test:coverage
```

## 🎨 Example Test Output

```
PASS  __tests__/health.test.js
  Health Check API
    GET /api/health
      ✓ should return health status (45ms)
      ✓ should return valid timestamp (12ms)
      ✓ should return positive uptime (10ms)

PASS  __tests__/auth.test.js
  Authentication API
    POST /api/auth/register
      ✓ should register a new user successfully (156ms)
      ✓ should fail with missing required fields (23ms)
      ✓ should fail with duplicate email (34ms)

Test Suites: 4 passed, 4 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        8.234 s
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

## ✅ Quick Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Run in watch mode |
| `npm run test:coverage` | Run with coverage |
| `npm test -- auth.test.js` | Run specific test file |
| `npm test -- --verbose` | Run with verbose output |

---

Happy Testing! 🧪
