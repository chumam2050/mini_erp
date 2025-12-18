#!/bin/bash
set -e

echo "Running post-create setup..."

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=password psql -h db -U user -d postgres -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - checking databases..."

# Check if minierp database exists
DB_EXISTS=$(PGPASSWORD=password psql -h db -U user -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='minierp'")
if [ "$DB_EXISTS" = "1" ]; then
    echo "Database 'minierp' already exists."
else
    PGPASSWORD=password psql -h db -U user -d postgres -c "CREATE DATABASE minierp;"
    echo "Database 'minierp' created successfully."
fi

# Check if minierp_test database exists
DB_TEST_EXISTS=$(PGPASSWORD=password psql -h db -U user -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='minierp_test'")
if [ "$DB_TEST_EXISTS" = "1" ]; then
    echo "Database 'minierp_test' already exists."
else
    PGPASSWORD=password psql -h db -U user -d postgres -c "CREATE DATABASE minierp_test;"
    echo "Database 'minierp_test' created successfully."
fi

echo "Database setup completed!"

echo "Post-create setup completed!"
