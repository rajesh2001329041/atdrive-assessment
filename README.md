# MEAN Stack Assessment – Setup and Run Instructions

This project has two parts: an Express API in `server` (MongoDB for products, MySQL for users and orders) and an Angular app in `client`.

## Prerequisites

- Node.js 20.19 or newer (22 LTS recommended), which includes npm
- MongoDB running locally (default: `mongodb://127.0.0.1:27017`)
- MySQL running locally (default port `3306`)

## 1. Get the code

```bash
git clone <repository-url>
cd <repository-folder>
```

## 2. Set up and run the API (server)

```bash
cd server
npm install
```

Create the environment file from the template:

```bash
# macOS / Linux
cp .env.example .env

# Windows (Command Prompt)
copy .env.example .env
```

Open `server/.env` and set your own values:

| Variable | What to set |
|---|---|
| `MYSQL_USER` and `MYSQL_PASSWORD` | Your local MySQL login (the password can be empty if your MySQL has none) |
| `JWT_SECRET` | Any long random string |
| `MONGO_URI` | Only change it if MongoDB is not on the default address |

Start the API:

```bash
npm start
```

You should see `MongoDB connected`, `MySQL ready` and `API listening on http://localhost:3000`. The MySQL database (`atdrive_app`) and its tables are created automatically on the first start, and MongoDB creates its database on first use.

## 3. Set up and run the client (Angular app)

Open a second terminal:

```bash
cd client
npm install
npm start
```

The app opens at **http://localhost:4200**. It expects the API at `http://localhost:3000/api`. If your API runs on a different address, change `apiUrl` in `client/src/environments/environment.development.ts`.

## 4. Use the application

1. Open http://localhost:4200 and click **Create an account**.
2. Register with a username (at least 3 characters) and a password (at least 6 characters). You are signed in automatically.
3. Use **Products** to add, edit and delete products, **Orders** to place and manage orders, and **Dashboard** to see your totals and the weather for a city.

## Troubleshooting

- **"Cannot reach the server"** in the app: the API is not running. Start it with `npm start` inside `server`.
- **`Failed to start server`** in the API terminal: check that MongoDB and MySQL are running and that the values in `server/.env` are correct.
- **Port already in use**: stop the other program using port 3000 or 4200, or change `PORT` in `server/.env`.
