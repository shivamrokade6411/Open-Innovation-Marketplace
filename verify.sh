#!/usr/bin/env bash

# Setup colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================="
echo "        SERVICE VERIFICATION SCRIPT"
echo "========================================="

check_endpoint() {
  local name=$1
  local url=$2
  local method=$3
  local data=$4
  local expected_status=$5
  local response
  local status

  echo -n "Checking $name ($url)... "

  if [ "$method" == "POST" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url")
  else
    response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$url")
  fi

  if [ "$response" -eq "$expected_status" ] || [ "$response" -eq 200 ] || [ "$response" -eq 201 ]; then
    echo -e "${GREEN}✅ PASS (Status: $response)${NC}"
    return 0
  else
    echo -e "${RED}❌ FAIL (Status: $response, Expected: $expected_status)${NC}"
    return 1
  fi
}

# 1. Backend Health Check
check_endpoint "Backend Health Check" "http://localhost:5000/api/health" "GET" "" 200

# 2. Frontend Health Check
check_endpoint "Frontend Health Check" "http://localhost:3000" "GET" "" 200

# Generate a unique email using timestamp
UNIQUE_EMAIL="verify_test_$(date +%s)@oim.dev"
REG_DATA="{\"name\":\"Verify User\",\"email\":\"$UNIQUE_EMAIL\",\"password\":\"VerifyPass@123\",\"role\":\"innovator\"}"

# 3. Auth Flow - Register
check_endpoint "Auth - Registration" "http://localhost:5000/api/auth/register" "POST" "$REG_DATA" 201

# 4. Auth Flow - Login
LOGIN_DATA="{\"email\":\"$UNIQUE_EMAIL\",\"password\":\"VerifyPass@123\"}"
check_endpoint "Auth - Login" "http://localhost:5000/api/auth/login" "POST" "$LOGIN_DATA" 200

# 5. Challenges List
check_endpoint "Challenges Discovery API" "http://localhost:5000/api/challenges" "GET" "" 200

echo "========================================="
