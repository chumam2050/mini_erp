# Generate JWT Secret 🔐

Use `generateJwtSecret.js` to create a cryptographically-secure JWT secret for production deployments.

Usage:

- Print a secret to stdout:

```bash
node src/scripts/generateJwtSecret.js
```

- Save to a `.env` file (will replace existing `JWT_SECRET` or append if not present):

```bash
node src/scripts/generateJwtSecret.js --save .env
```

- Specify length in bytes (default: 64):

```bash
node src/scripts/generateJwtSecret.js --length 48
```

- Via npm script:

```bash
npm run generate:jwt-secret
```

Security notes:
- Keep the generated secret out of version control; use secrets manager for production if possible.
- The script writes the `.env` file with permissions `0600` when using `--save`.
