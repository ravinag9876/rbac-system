async function runTest() {
    console.log("--- STARTING API TEST ---");

    // STEP 1: Attempt to log in
    console.log("\n1. Logging in as Admin...");
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginRes.json();
    
    if (loginData.token) {
        console.log("✅ SUCCESS: Received JWT Token:");
        console.log("   " + loginData.token.substring(0, 40) + "...");
    } else {
        console.log("❌ FAILED: Could not log in.", loginData);
        return;
    }

    // STEP 2: Use the token to hit the protected route
    console.log("\n2. Accessing Protected '/api/users' route...");
    const usersRes = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${loginData.token}` 
        }
    });

    const usersData = await usersRes.json();
    console.log("✅ SUCCESS: Server authorized the token and returned the database rows:");
    console.log(usersData);
    console.log("\n--- TEST COMPLETE ---");
}

runTest();