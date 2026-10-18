# Student Timetable Manager (CRUD)

A simple full-stack timetable application built with Node.js, Express, MySQL, HTML, CSS and JavaScript. It covers database setup (Part A), REST API endpoints (Part B), and a browser-based CRUD interface (Part C).

## Project structure

```text
node-mysql-crud/
├── backend/
│   ├── .env              # Local database settings (not committed)
│   ├── .gitignore
│   ├── package.json
│   ├── schema.sql
│   ├── db.js
│   └── server.js
├── frontend/
│   ├── index.html
│   └── app.js
└── README.md
```

## Requirements

- Node.js (LTS recommended)
- MySQL Server, or a compatible MySQL database
- A browser
- Optional: Postman for API evidence

## 1. Set up the database

1. Start MySQL.
2. Open phpMyAdmin or a MySQL client.
3. Import `backend/schema.sql`.
4. The script creates the `campus_crud` database, the `timetable` table, and 10 sample records if the table is empty.

The schema is intentionally written not to drop existing timetable data.

## 2. Configure the backend

Open `backend/.env` and set the values for your local MySQL installation:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=campus_crud
```

If your MySQL root account has a password, enter it after `DB_PASSWORD=`. Do not commit `.env` or publish database passwords.

Open a terminal in the project folder and run:

```bash
cd backend
npm install
npm start
```

The API should run at `http://localhost:3000`. Visiting that address should return:

```json
{"message":"Timetable API Running"}
```

## 3. Open the frontend

With the backend and MySQL running, open `frontend/index.html` in a browser. If your browser restricts local-file requests, serve the frontend with a local static server (for example, VS Code Live Server). The frontend expects the API at `http://localhost:3000/api/timetable`.

## 4. API endpoints (Part B)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/timetable` | List all records |
| GET | `/api/timetable/:id` | Get one record |
| POST | `/api/timetable` | Create a record |
| PUT | `/api/timetable/:id` | Update a record |
| DELETE | `/api/timetable/:id` | Delete a record |

### Postman test examples

Base URL: `http://localhost:3000`

**GET all records**
```http
GET http://localhost:3000/api/timetable
```

**GET one record**
```http
GET http://localhost:3000/api/timetable/1
```

**POST a record** — select Body → raw → JSON:
```json
{
  "course_code": "ICT299",
  "course_name": "Test",
  "lecturer_name": "Mr Test",
  "venue": "Lab 5",
  "day_of_week": "Monday",
  "start_time": "10:00:00",
  "end_time": "12:00:00"
}
```

Use the returned `id` in the URL for PUT and DELETE. For example, if the new record has ID 11:

**PUT**
```http
PUT http://localhost:3000/api/timetable/11
```
Send the same JSON body, changing a field such as `course_name` to `Updated Test`.

**DELETE**
```http
DELETE http://localhost:3000/api/timetable/11
```

For submission evidence, record your own screen showing the method, URL, request body (for POST/PUT), and JSON response in Postman.

## 5. GitHub upload

From the project root:

```bash
git init
git add .
git commit -m "Add timetable CRUD project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the example remote URL with your own GitHub repository URL. If the repository is already initialized, do not run `git init` again; just add, commit, and push your changes.

## Notes before deployment

- `.env` is excluded from Git by `backend/.gitignore`. Configure environment variables in your hosting provider instead.
- The frontend API URL is set to `http://localhost:3000`; change it to your deployed API URL before hosting the frontend publicly.
- Use a managed MySQL provider for a hosted backend. A local MySQL server on your laptop is not reachable by a cloud deployment.
- Test the endpoints and capture genuine screenshots/video evidence before submitting.
