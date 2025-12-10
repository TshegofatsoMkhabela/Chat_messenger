# How to Run Locally

You need to run the **Client** and **Server** in separate terminals.

## 1. Start the Server
1.  Open a terminal.
2.  Navigate to the server directory:
    ```bash
    cd server
    ```
3.  Install dependencies (if not already installed):
    ```bash
    npm install
    ```
4.  Start the server:
    ```bash
    npm run server
    ```
    *This runs `nodemon server.js`, which restarts the server on file changes.*

## 2. Start the Client
1.  Open a **new** terminal.
2.  Navigate to the client directory:
    ```bash
    cd client
    ```
3.  Install dependencies (if not already installed):
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    *This runs `vite`.*

## 3. Access the App
- The server usually runs on **5000** (checked from your error logs).
- The client runs at `http://localhost:5173`.
