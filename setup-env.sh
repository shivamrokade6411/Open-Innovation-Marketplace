#!/usr/bin/env bash

# Setup colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================="
echo "        ENVIRONMENT SETUP SCRIPT"
echo "========================================="

# Helper to generate random keys
generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 64 | tr -d '\n\r'
  else
    # Fallback to Node.js random byte generator
    node -e "console.log(require('crypto').randomBytes(64).toString('base64'))" | tr -d '\n\r'
  fi
}

# Prompt helper
prompt_var() {
  local var_name=$1
  local prompt_text=$2
  local default_val=$3
  local user_val

  read -p "$prompt_text [$default_val]: " user_val
  if [ -z "$user_val" ]; then
    echo "$default_val"
  else
    echo "$user_val"
  fi
}

# Validate MongoDB URI
validate_mongo_uri() {
  local uri=$1
  if [[ $uri =~ ^mongodb(\+srv)?://.+ ]]; then
    return 0
  else
    return 1
  fi
}

echo "Generating random secrets for authentication..."
JWT_ACCESS_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)

echo -e "${GREEN}Secrets generated successfully.${NC}"
echo ""

# Gather input
echo "Please enter the following configuration variables:"
echo ""

MONGODB_URI=""
while true; do
  MONGODB_URI=$(prompt_var "MONGODB_URI" "Enter MongoDB URI" "mongodb://localhost:27017/oim")
  if validate_mongo_uri "$MONGODB_URI"; then
    break
  else
    echo -e "${RED}Invalid MongoDB URI format! Must start with 'mongodb://' or 'mongodb+srv://'. Please try again.${NC}"
  fi
done

REDIS_URL=$(prompt_var "REDIS_URL" "Enter Redis URL" "redis://localhost:6379")

# Optional keys
CLOUDINARY_CLOUD_NAME=$(prompt_var "CLOUDINARY_CLOUD_NAME" "Enter Cloudinary Cloud Name (optional)" "")
CLOUDINARY_API_KEY=$(prompt_var "CLOUDINARY_API_KEY" "Enter Cloudinary API Key (optional)" "")
CLOUDINARY_API_SECRET=$(prompt_var "CLOUDINARY_API_SECRET" "Enter Cloudinary API Secret (optional)" "")

OPENAI_API_KEY=$(prompt_var "OPENAI_API_KEY" "Enter OpenAI API Key (optional)" "")
OPENAI_ORG_ID=$(prompt_var "OPENAI_ORG_ID" "Enter OpenAI Org ID (optional)" "")

SMTP_HOST=$(prompt_var "SMTP_HOST" "Enter SMTP Host (optional)" "")
SMTP_PORT=$(prompt_var "SMTP_PORT" "Enter SMTP Port (optional)" "587")
SMTP_USER=$(prompt_var "SMTP_USER" "Enter SMTP Username (optional)" "")
SMTP_PASS=$(prompt_var "SMTP_PASS" "Enter SMTP Password (optional)" "")

RAZORPAY_KEY_ID=$(prompt_var "RAZORPAY_KEY_ID" "Enter Razorpay Key ID (optional)" "")
RAZORPAY_KEY_SECRET=$(prompt_var "RAZORPAY_KEY_SECRET" "Enter Razorpay Key Secret (optional)" "")

STRIPE_SECRET_KEY=$(prompt_var "STRIPE_SECRET_KEY" "Enter Stripe Secret Key (optional)" "")
STRIPE_WEBHOOK_SECRET=$(prompt_var "STRIPE_WEBHOOK_SECRET" "Enter Stripe Webhook Secret (optional)" "")

FRONTEND_URL=$(prompt_var "FRONTEND_URL" "Enter Frontend Application URL" "http://localhost:3000")
BACKEND_URL=$(prompt_var "BACKEND_URL" "Enter Backend API URL" "http://localhost:5000")
PORT=$(prompt_var "PORT" "Enter Backend Port" "5000")
NODE_ENV=$(prompt_var "NODE_ENV" "Enter Environment (development/production)" "development")

# Writing configuration to files
write_env_files() {
  local target_path=$1
  cat <<EOF > "$target_path"
# Database
MONGODB_URI=$MONGODB_URI
REDIS_URL=$REDIS_URL

# Auth
JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET

# OpenAI
OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_ORG_ID=$OPENAI_ORG_ID

# Email
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS

# Payments
RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET

# App
FRONTEND_URL=$FRONTEND_URL
BACKEND_URL=$BACKEND_URL
PORT=$PORT
NODE_ENV=$NODE_ENV
EOF
}

echo ""
echo "Writing environment files..."

# Write at the root
write_env_files ".env"

# Write in backend
mkdir -p apps/backend
write_env_files "apps/backend/.env"

# Write in frontend (creating next public env vars as well)
mkdir -p apps/frontend
cat <<EOF > "apps/frontend/.env.local"
# Frontend Env Configuration
NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL
NEXT_PUBLIC_FRONTEND_URL=$FRONTEND_URL

# Database (optional for server actions/SSR if needed directly, fallback to API)
MONGODB_URI=$MONGODB_URI
REDIS_URL=$REDIS_URL

# Auth
JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID
EOF

echo -e "${GREEN}Environment variables configured successfully!${NC}"
echo -e "Configured: ${YELLOW}.env${NC}, ${YELLOW}apps/backend/.env${NC}, and ${YELLOW}apps/frontend/.env.local${NC}"
echo "========================================="
