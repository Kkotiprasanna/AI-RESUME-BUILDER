# AI Resume Builder — Separate Client and Server

This project is organized into two independent folders:
- `client/` — React + Vite frontend
- `server/` — Express + MongoDB backend

## Requirements
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- Optional Gemini API key for live AI text improvement

## Folder structure

```text
AI-RESUME-BUILDER/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Resume.js
│   │   └── User.js
│   ├── routes/
│   │   ├── ai.js
│   │   ├── auth.js
│   │   └── resumes.js
│   ├── index.js
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

## Setup — recommended single-terminal method

1. Extract the ZIP and open the root `AI-RESUME-BUILDER` folder in VS Code.
2. Install the root runner and both application dependencies:

   ```bash
   npm install
   npm run install:all
   ```

3. Create the server environment file:
   - Windows PowerShell: `Copy-Item server/.env.example server/.env`
   - macOS/Linux: `cp server/.env.example server/.env`

4. Edit `server/.env`:
   - Set `MONGODB_URI` to your MongoDB connection.
   - Replace `JWT_SECRET` with a long random secret.
   - Add `GEMINI_API_KEY` to enable live Gemini AI. Without it, the AI button uses a demo fallback and does not call a live AI model.

5. Make sure MongoDB is running.
6. From the root folder, run:

   ```bash
   npm run dev
   ```

7. Open `http://localhost:5173`.

The root `dev` script starts the backend at `http://localhost:5000` and the frontend at `http://localhost:5173`.

## Run client and server separately (two terminals)

Terminal 1 — backend:

```bash
cd server
npm install
# create .env from .env.example, then configure it
npm run dev
```

Terminal 2 — frontend:

```bash
cd client
npm install
npm run dev
```

## Main features
- User registration and login (bcrypt password hashing and JWT authentication)
- Create, list, edit and delete resumes
- Personal information, education, work experience, skills and projects
- AI-generated summary and improved experience descriptions
- Modern and classic resume templates
- Live resume preview
- Browser print dialog / Save as PDF

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API health check |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/resumes` | List current user's resumes |
| POST | `/api/resumes` | Create resume |
| GET | `/api/resumes/:id` | Get one resume |
| PUT | `/api/resumes/:id` | Update resume |
| DELETE | `/api/resumes/:id` | Delete resume |
| POST | `/api/ai/improve` | Improve summary or experience text |

## Important
Keep secrets in `server/.env`; never put the Gemini key in the client folder or commit `.env`. This is a student project starter, not a production-hardened deployment. Before production, add rate limiting, security headers, more validation and automated tests.
