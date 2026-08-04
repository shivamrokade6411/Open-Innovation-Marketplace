const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const NC = '\x1b[0m'; // No Color

console.log("=========================================");
console.log("        SERVICE VERIFICATION SCRIPT");
console.log("=========================================");

async function checkEndpoint(name, url, method, data, expectedStatus) {
  process.stdout.write(`Checking ${name} (${url})... `);
  try {
    const options = {
      method: method,
      headers: {}
    };
    if (method === 'POST') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }

    const res = await fetch(url, options);
    const status = res.status;
    let body = null;
    try {
      body = await res.json();
    } catch (e) {
      // Ignore if not JSON
    }

    if (status === expectedStatus || status === 200 || status === 201) {
      console.log(`${GREEN}✅ PASS (Status: ${status})${NC}`);
      return { success: true, body };
    } else {
      console.log(`${RED}❌ FAIL (Status: ${status}, Expected: ${expectedStatus})${NC}`);
      return { success: false, body };
    }
  } catch (error) {
    console.log(`${RED}❌ FAIL (Error: ${error.message})${NC}`);
    return { success: false, body: null };
  }
}

async function main() {
  // 1. Backend Health Check
  await checkEndpoint("Backend Health Check", "http://localhost:5000/api/health", "GET", null, 200);

  // 2. Frontend Health Check
  await checkEndpoint("Frontend Health Check", "http://localhost:3000", "GET", null, 200);

  // Generate a unique email using timestamp
  const uniqueEmail = `verify_test_${Math.floor(Date.now() / 1000)}@oim.dev`;
  const regData = {
    name: "Verify User",
    email: uniqueEmail,
    password: "VerifyPass@123",
    role: "innovator"
  };

  // 3. Auth Flow - Register
  const regResult = await checkEndpoint("Auth - Registration", "http://localhost:5000/api/auth/register", "POST", regData, 201);
  
  if (regResult.success && regResult.body && regResult.body.data && regResult.body.data.verifyToken) {
    const token = regResult.body.data.verifyToken;
    // Call verification endpoint
    await checkEndpoint("Auth - Email Verification", `http://localhost:5000/api/auth/verify-email/${token}`, "GET", null, 200);
  } else {
    console.log(`${RED}⚠️ Warning: Could not retrieve verifyToken from registration response${NC}`);
  }

  // 4. Auth Flow - Login
  const loginData = {
    email: uniqueEmail,
    password: "VerifyPass@123"
  };
  await checkEndpoint("Auth - Login", "http://localhost:5000/api/auth/login", "POST", loginData, 200);

  // 5. Challenges List
  await checkEndpoint("Challenges Discovery API", "http://localhost:5000/api/challenges", "GET", null, 200);

  console.log("=========================================");
}

main();
