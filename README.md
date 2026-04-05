# Chaitra K Portfolio Website

A responsive full-stack personal portfolio website built to present professional information, showcase skills and projects, and collect contact form submissions through a MongoDB-backed backend.

## Overview

This project is designed as a personal portfolio for GitHub viewers, recruiters, and collaborators. It combines a modern frontend interface with a lightweight Node.js and Express backend that stores contact form messages in MongoDB.

The website includes:
- A landing section with introduction and call-to-action
- An about section highlighting education, passion, and approach
- A skills section presenting technical strengths
- A projects section summarizing featured work
- A contact form that validates user input and saves messages to MongoDB

## Key Features

- Responsive portfolio layout for desktop and mobile
- Modern glassmorphism-inspired UI design
- Client-side form validation for cleaner submissions
- Express backend for handling contact requests
- MongoDB integration for storing submitted messages
- Static asset serving through the backend
- Clean and simplified project structure

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Package Management: npm
- Version Control: Git and GitHub

## Project Structure

```text
My Portfolio/
|-- index.html          # Main portfolio page
|-- style.css           # Styling and responsive design
|-- script.js           # Frontend interactions and form handling
|-- server.js           # Express server and MongoDB connection
|-- package.json        # Project metadata and scripts
|-- package-lock.json   # Locked dependency versions
|-- background.jpg      # Background image asset
|-- README.md           # Project documentation
```

## How It Works

### Frontend

The frontend presents the portfolio content and includes a contact form. JavaScript validates the fields before submission and sends the data to the backend using a `POST /contact` request.

### Backend

The backend is built with Express and serves both the static website files and the API endpoint for contact form submission.

Main backend responsibilities:
- Serve the portfolio website locally
- Accept contact form submissions
- Validate incoming request data
- Store valid messages in MongoDB
- Return clear success or error responses to the frontend

### Database

Submitted messages are stored in MongoDB under:
- Database: `portfolio_db`
- Collection: `messages`

Each saved message includes:
- `name`
- `email`
- `subject`
- `message`
- `createdAt`

## Installation and Setup

### Prerequisites

Make sure the following are installed:
- Node.js
- npm
- MongoDB

### Local Setup

1. Clone the repository:

```bash
git clone <your-repository-url>
cd "My Portfolio"
```

2. Install dependencies:

```bash
npm install
```

3. Create a local environment file from `.env.example` and set your values.

4. Make sure MongoDB is running locally at:

```text
mongodb://127.0.0.1:27017
```

5. Start the server:

```bash
npm start
```

6. Open the project in your browser:

```text
http://localhost:3000
```

## Available Scripts

- `npm start`  
  Starts the Express server

- `npm run dev`  
  Runs the same local server setup

- `npm run check`  
  Performs a syntax check on the JavaScript files

## Environment Variables

- `PORT`  
  Local server port. Render sets this automatically in production.

- `MONGODB_URI`  
  MongoDB connection string. Required on Render.

- `MONGODB_DB`  
  MongoDB database name. Defaults to `portfolio_db`.

## Deploying to Render

1. Push this project to GitHub.
2. Create a new Web Service in Render and connect the repository.
3. Render can read the included `render.yaml`, or you can configure these values manually:

```text
Build Command: npm install
Start Command: npm start
```

4. In Render environment variables, set:

```text
NODE_ENV=production
MONGODB_URI=<your-mongodb-atlas-connection-string>
MONGODB_DB=portfolio_db
```

5. Use `/health` as the health check path.

Notes:
- Render does not provide a local MongoDB instance for this app, so use MongoDB Atlas or another hosted MongoDB service.
- The app already listens on `process.env.PORT`, which is required for Render.
- If `MONGODB_URI` is missing or invalid, the portfolio still deploys and loads, but the contact form returns a temporary unavailability message until the database is configured.

## Contact Form Flow

1. A visitor fills in the contact form
2. The frontend validates the input fields
3. The form submits data to `/contact`
4. The backend validates the data again
5. The backend stores the message in MongoDB
6. The user receives a success or error message on the page

## Professional Purpose of This Project

This portfolio is intended to:
- Present a strong professional profile online
- Showcase frontend and backend development capability
- Demonstrate practical MongoDB integration
- Provide a direct communication channel for recruiters, clients, or collaborators

## Future Improvements

Potential enhancements for future versions:
- Add a dedicated admin dashboard for viewing messages
- Deploy the project online for public access
- Add project links and GitHub repository buttons
- Improve accessibility and SEO metadata
- Add animations or section transitions with performance optimization

## Author

**Chaitra K**  
BCA Student | Full Stack Developer | Creative Problem Solver

## License

This project is open for learning, inspiration, and professional portfolio reference.
