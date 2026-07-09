# Vital Home Solutions

Frontend plus PHP/MySQL backend and MySQL-powered admin panel for Sahyadri Surgical.

## What's included

- Dynamic frontend content driven by MySQL
- JWT-authenticated admin panel
- CRUD for categories, products, services, gallery, testimonials, blogs, vendors, SEO, and enquiries
- Upload endpoints for local file storage
- Seeded demo content copied from the current frontend

## Default database settings

- Database: `sahyadri_surgical`
- Host: `localhost`
- User: `root`
- Password: `root`

## Environment setup

Create a `.env` file in the project root using `.env.example` as a guide.
Make sure PHP 8+ is installed and available on your PATH.

## Install

```bash
npm install
```

## Run the backend

```bash
npm run server
```

This starts the PHP built-in server on `http://localhost:5000`.

## Run the frontend

```bash
npm run dev -- --host 0.0.0.0
```

The Vite dev server will use the first available port. In this environment it started on `http://localhost:8081/`.

## Build

```bash
npm run build
```

## Seeded admin login

- Username: `sahyadri-surgical_admin`
- Password: `Sahyadrisurgical@123##`

## Notes

- The backend auto-creates the database and tables if they do not exist.
- Seed data is loaded from `backend/seed-data.json`, generated from the current seed content.
- Uploaded files are stored in the local `uploads/` folder.
