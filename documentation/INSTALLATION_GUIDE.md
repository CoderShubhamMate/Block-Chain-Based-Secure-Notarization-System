# INSTALLATION & CONFIGURATION GUIDE
## Blockchain-Based Secure Notarization System (BBSNS)

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher (Running on Port 5433)
- **Java Runtime Environment (JRE)**: v17+ (For legacy bridge)
- **Git**: For version control

---

### 2. Database Setup
1. Create a database named `bbsns`.
2. Configure credentials in the backend environment.
3. Apply migrations in order:
```bash
cd backend
# Run your migration tool or psql
psql -h localhost -p 5433 -U postgres -d bbsns -f migrations/...
```

---

### 3. Backend Configuration
1. Navigate to the `backend` directory.
2. Create or update `.env` with the following:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=bbsns
JWT_SECRET=your_secure_random_string
HASH_SALT=your_secure_salt
BOOTSTRAP_ADMIN_WALLET=0xYourInitialWallet
```
3. Install dependencies and start:
```bash
npm install
npm run dev
```

---

### 4. Web Application Setup
1. Navigate to the `Web-App` directory.
2. Install dependencies:
```bash
npm install
npm run dev
```
3. Access at `http://localhost:3000`.

---

### 5. Desktop Application Setup & Packaging
1. Navigate to the `Frontend Desktop Application` directory.
2. Install dependencies:
```bash
npm install
npm run electron-dev
```

#### 🏗️ Building the Installer (.exe)
The project uses **Electron Builder** to package the application.

1.  **Prepare Assets**: Ensure `assets/icon.ico` (256x256) is present.
2.  **Compile & Package**: Run the distribution command:
    ```bash
    npm run dist-win
    ```
3.  **Locate Output**: The installer will be generated in the `dist/` folder:
    - `BBSNS Desktop Application Setup [version].exe`

#### 🔐 Distribution & Signing
By default, Windows may show a security warning for "Unknown Publisher".
- **For Production**: The `.exe` should be signed with an EV Code Signing Certificate.
- **For Development**: Users can bypass the SmartScreen warning by clicking "More Info" -> "Run anyway".

---

### 6. Common Issues & Troubleshooting
- **Port Conflicts**: Ensure 3000 (Web), 3001 (Electron Vite), 5000 (Backend), and 5433 (DB) are free.
- **CORS Errors**: Check `allowedOrigins` in `backend/src/app.js`.
- **Wallet Connection**: Ensure MetaMask is installed in the browser for the Remote Signing flow.
