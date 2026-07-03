# Distributed Role-Based Access Control (RBAC) Architecture



A secure, decoupled full-stack authentication gateway designed for granular user administration and cryptographic session handling. 



This system replaces vulnerable cookie-based authentication patterns with an intercepted, middleware-driven JWT architecture, dynamically syncing verified privilege tiers with a protected React DOM.



## 🚀 Core Features



* **Cryptographic Session Handling:** Utilizes JSON Web Tokens (JWT) and `bcryptjs` for robust credential hashing and stateless session validation.

* **Custom Authorization Middleware:** A Node.js interceptor that rigorously validates API requests before they reach protected endpoints, instantly blocking unauthorized privilege escalation.

* **Dynamic Protected Routing:** The React frontend utilizes global context providers to actively restructure the UI, completely hiding administrative components and tables from unauthorized user tiers.

* **Relational Data Persistence:** Highly optimized SQLite schema to persistently manage user identities, secure access tiers, and dynamic system configurations.



## 🛠️ Technology Stack



* **Frontend:** React.js, Context API, React Router

* **Backend:** Node.js, Express.js

* **Security:** JWT (JSON Web Tokens), bcryptjs

* **Database:** SQLite



## ⚙️ Local Installation \& Setup



**1. Clone the repository**

```bash

git clone https://github.com/ravinag9876/rbac-system.git

cd rbac-system

```



**2. Install Dependencies**

You will need to install dependencies for both the frontend and backend environments.

```bash

#Install backend dependencies

cd backend

npm install



#Install frontend dependencies

cd ../frontend

npm install

```



**3. Environment Configuration**

Create a `.env` file in the `backend` directory and add your secret keys:

```env

PORT=5000

JWT\_SECRET=your\_super\_secret\_cryptographic\_key\_here

```



**4. Initialize the Database and Run**

```bash

#Start the Express server (from the /backend directory)

npm run dev



#Start the React client (from the /frontend directory in a new terminal)

npm start

```

## 👥 User Management \& Seeding



Because passwords are cryptographically hashed via `bcryptjs`, you cannot manually insert plain-text users directly into the SQLite database. 



To create your first Admin user and test the Role-Based Access Control logic, use the authentication endpoint once the server is running.



**Register a Test Admin via cURL:**

```bash

curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "username": "admin_test",
  "password": "securepassword123",
  "role": "Admin"
}'

```



\*(Note: In a true production environment, the `role` assignment is stripped from public registration endpoints and requires an existing Admin session token to elevate privileges. It is left open here strictly for local demonstration purposes.)\*



**Testing the Roles:**

1. Log in with the newly created Admin account.

2. Observe the JWT returned in the response payload.

3. The React frontend will decode this token and dynamically mount the Admin Dashboard and User Management tables.

4. Create a second account with the role `"User"` and log in to verify that the protected routes successfully block access and unmount the administrative UI.

## 🔒 Security Architecture Flow



1. **Authentication:** Client submits credentials. Backend validates against the SQLite schema using `bcryptjs`.

2. **Token Generation:** Upon success, a cryptographically signed JWT is issued to the client containing their encrypted role tier.

3. **API Interception:** Every subsequent request to a protected route passes through the Express middleware, which unpacks the JWT and verifies the role against endpoint requirements.

4. **UI Hydration:** The React frontend decodes the access tier and dynamically mounts/unmounts DOM elements based on the verified clearance level.

