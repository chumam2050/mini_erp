docker build -t choerul/retaliq-minierp-frontend:1.0.2 -f packages/frontend/Dockerfile packages/frontend --no-cache

docker build -t choerul/retaliq-minierp-backend:1.0.2 -f packages/backend/Dockerfile packages/backend --no-cache