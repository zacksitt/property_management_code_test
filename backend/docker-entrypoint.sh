#!/bin/sh
set -e

echo "🔍 Waiting for database to be ready..."
echo "📊 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_DATABASE"
echo "   Username: $DB_USERNAME"
echo "   Password: $DB_PASSWORD"
echo ""

# Wait for database to be available with timeout
MAX_RETRIES=30
RETRY_COUNT=0

until node -e "const { Client } = require('pg'); const client = new Client({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE }); client.connect().then(() => { console.log('Database connection successful!'); client.end(); process.exit(0); }).catch(err => { process.exit(1); });" 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ Database did not become ready in time. Exiting..."
    exit 1
  fi
  
  echo "⏳ Database is unavailable (attempt $RETRY_COUNT/$MAX_RETRIES) - retrying in 2s..."
  sleep 2
done

echo "✅ Database is ready!"

# Run migrations
echo "🚀 Running database migrations..."
npm run migration:run

# Run seed (only if RUN_SEED env variable is set to true)
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Running database seed..."
  npm run seed
else
  echo "⏭️  Skipping database seed (set RUN_SEED=true to enable)"
fi

echo "🎉 Database setup complete!"

# Start the application
echo "🚀 Starting application..."
exec "$@"

