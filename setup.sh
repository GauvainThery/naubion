#!/bin/bash

# naubion Setup Script
# Automated setup for new contributors

set -e  # Exit on any error

echo "🚀 Setting up naubion development environment..."
echo

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/ or use brew install node"
    exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    
    # Detect OS and provide instructions
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   On macOS, run: brew install postgresql@15"
        echo "   Then run: brew services start postgresql@15"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "   On Ubuntu/Debian, run:"
        echo "   sudo apt update && sudo apt install postgresql postgresql-contrib"
        echo "   sudo systemctl start postgresql && sudo systemctl enable postgresql"
    fi
    
    echo "   After installing PostgreSQL, run this script again."
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo "✅ Dependencies installed!"
echo

# Setup PostgreSQL database
echo "🗄️ Setting up PostgreSQL database..."

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw naubion; then
    echo "✅ Database 'naubion' already exists"
else
    echo "Creating database 'naubion'..."
    createdb naubion
    echo "✅ Database created!"
fi

# Check if user exists
if psql naubion -tAc "SELECT 1 FROM pg_roles WHERE rolname='naubion'" | grep -q 1; then
    echo "✅ User 'naubion' already exists"
else
    echo "Creating user 'naubion'..."
    psql naubion -c "CREATE USER naubion WITH ENCRYPTED PASSWORD 'naubion_password';"
    psql naubion -c "GRANT ALL PRIVILEGES ON DATABASE naubion TO naubion;"
    psql naubion -c "GRANT ALL ON SCHEMA public TO naubion;"
    psql naubion -c "ALTER USER naubion CREATEDB;"
    echo "✅ User created and permissions granted!"
fi

# Test database connection
echo "Testing database connection..."
if psql -h localhost -U naubion -d naubion -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed. Please check your PostgreSQL setup."
    exit 1
fi

echo

# Setup environment file
echo "⚙️ Setting up environment configuration..."
if [ ! -f "apps/backend/.env" ]; then
    cp apps/backend/.env.example apps/backend/.env
    
    # Update database configuration in .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's/^#.*DB_HOST=.*/DB_HOST=localhost/' apps/backend/.env
        sed -i '' 's/^#.*DB_PORT=.*/DB_PORT=5432/' apps/backend/.env
        sed -i '' 's/^#.*DB_USERNAME=.*/DB_USERNAME=naubion/' apps/backend/.env
        sed -i '' 's/^#.*DB_PASSWORD=.*/DB_PASSWORD=naubion_password/' apps/backend/.env
        sed -i '' 's/^#.*DB_DATABASE=.*/DB_DATABASE=naubion/' apps/backend/.env
        sed -i '' 's/^#.*DB_SYNCHRONIZE=.*/DB_SYNCHRONIZE=true/' apps/backend/.env
        sed -i '' 's/^#.*DB_LOGGING=.*/DB_LOGGING=false/' apps/backend/.env
        sed -i '' 's/^#.*CACHE_ANALYSIS_RESULTS=.*/CACHE_ANALYSIS_RESULTS=true/' apps/backend/.env
        sed -i '' 's/^#.*CACHE_TTL_HOURS=.*/CACHE_TTL_HOURS=24/' apps/backend/.env
    else
        # Linux
        sed -i 's/^#.*DB_HOST=.*/DB_HOST=localhost/' apps/backend/.env
        sed -i 's/^#.*DB_PORT=.*/DB_PORT=5432/' apps/backend/.env
        sed -i 's/^#.*DB_USERNAME=.*/DB_USERNAME=naubion/' apps/backend/.env
        sed -i 's/^#.*DB_PASSWORD=.*/DB_PASSWORD=naubion_password/' apps/backend/.env
        sed -i 's/^#.*DB_DATABASE=.*/DB_DATABASE=naubion/' apps/backend/.env
        sed -i 's/^#.*DB_SYNCHRONIZE=.*/DB_SYNCHRONIZE=true/' apps/backend/.env
        sed -i 's/^#.*DB_LOGGING=.*/DB_LOGGING=false/' apps/backend/.env
        sed -i 's/^#.*CACHE_ANALYSIS_RESULTS=.*/CACHE_ANALYSIS_RESULTS=true/' apps/backend/.env
        sed -i 's/^#.*CACHE_TTL_HOURS=.*/CACHE_TTL_HOURS=24/' apps/backend/.env
    fi
    
    echo "✅ Environment file created and configured!"
else
    echo "✅ Environment file already exists"
fi

echo

# Build shared libraries
echo "🏗️ Building shared libraries..."
pnpm run build
echo "✅ Build completed!"
echo

# Final setup verification
echo "🧪 Verifying setup..."

# Check TypeScript compilation
if pnpm type-check > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful!"
else
    echo "⚠️ TypeScript compilation has issues. Run 'pnpm type-check' to see details."
fi

echo
echo "🎉 Setup completed successfully!"
echo
echo "📋 Next steps:"
echo "   1. Start development: pnpm dev"
echo "   2. Open frontend: http://localhost:3000"
echo "   3. Check backend API: http://localhost:3001/api/health"
echo "   4. View cache stats: http://localhost:3001/api/cache/stats"
echo
echo "📚 Resources:"
echo "   - Main README: README.md"
echo "   - Database setup: DATABASE_SETUP.md"
echo "   - Backend docs: apps/backend/README.md"
echo "   - Frontend docs: apps/frontend/README.md"
echo
echo "🚀 Happy coding!"
