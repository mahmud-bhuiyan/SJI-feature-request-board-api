# Feature Request Board API Documentation

Welcome to the Feature Request Board API documentation. This API is implemented using Node.js, Express.js and MongoDB, providing functionality for managing feature requests.

## Introduction

This Feature Request Board API is designed to help you efficiently organize and track feature requests. It leverages Node.js for server-side logic, Express.js for routing, and MongoDB for data storage.

## Accessing the Feature Request Board

To access the Feature Request Board, visit [Feature Request Board Live Link](https://mahmud-feature-request-board.vercel.app).

visit [Frontend git link](https://github.com/mahmud-bhuiyan/SJI-feature-request-board.git).

## Prerequisites

- Node.js and npm installed on your machine
- MongoDB(Mongoose) installed

## Installation And Usage

Follow these steps to set up and run the project:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mahmud-bhuiyan/SJI-feature-request-board-api.git
   ```

2. **Install dependencies:**

   ```bash
   cd SJI-feature-request-board-api
   npm install
   ```

3. **Create a .env file:**

   Create a `.env` file in the root of your project and add the following information:

   ```
   MONGO_URL=your_mongo_connection_url
   JWT_SECRET_KEY=your_SECRET_KEY
   DB_NAME=your_DB_name
   PORT=3001
   ```

   Replace `your_mongo_connection_url` with your actual MongoDB connection URI and choose a suitable `PORT`.

4. **Start the server:**

   ```bash
   npm start
   or
   nodemon start
   ```

   Access the application in a web browser at `http://localhost:3001`.

## Authentication

To access certain features of the API, you'll need to authenticate using a token. Follow the authentication process to obtain a token and include it in the headers for secure interactions.

## Endpoints

### **Check Health**

```http
GET /health
```

## Error Handling

The API is designed to handle various error scenarios, including:

- **Route Not Found (404):** The requested API route does not exist.

- **User Already Exists (400):** Attempting to register a user with an email that already exists in the system.

- **User Not Found (404):** The specified user could not be found.

- **Invalid User Credentials (401):** The provided credentials during user login are incorrect.

- **Invalid Token (401):** The authentication token provided is invalid or expired.

- **Invalid Token Signature (401):** The token signature does not match the expected signature.

- **Task Not Found (404):** The requested task could not be found.

- **Invalid Task Data (400):** The data provided for creating or updating a task is invalid or incomplete.

- **Other Potential Errors (status varies):** Additional errors may occur, each accompanied by an appropriate HTTP status code and a detailed error message.

## Folder Structure

```plaintext
project-root/
│
├── controllers/
│ ├── adminController.js
│ ├── featureController.js
│ ├── userController.js
│ ├── websiteConfigController.js
│
├── db/
│ ├── connect.js
│
├── errors/
│ ├── customError.js
│
├── middleware/
│ ├── asyncWrapper.js
│ ├── auth.js
│ ├── checkAdmin.js
│ ├── customErrorHandler.js
│ ├── notFound.js
│
├── models/
│ ├── Feature.js
│ ├── User.js
│ ├── WebsiteConfig.js
│
├── public/
│ ├── favicon.png
│ ├── index.html
│ ├── main.css
│
├── routes/
│ ├── adminRoutes.js
│ ├── featureRoutes.js
│ ├── userRoutes.js
│ ├── websiteRoutes.js
│
├── .env
├── .gitignore
├── index.js
├── package-lock.json
├── package.json
└── README.md
```

## Libraries Used

### Server

- **Node**
- **Express**

### Additional Libraries

- **bcrypt:** Library for hashing passwords.
- **body-parser:** Middleware for parsing incoming request bodies in Express.
- **cors:** Middleware for handling Cross-Origin Resource Sharing in Express.
- **dotenv:** Loads environment variables from a .env file into process.env.
- **express:** Web application framework for Node.js.
- **jsonwebtoken:** Library for generating and verifying JSON Web Tokens (JWT).
- **mongoose:** MongoDB object modeling for Node.js.
- **nodemon:** Utility that monitors for changes in files and automatically restarts the server.

## The END

Many Thanks to `SJ Innovation` and `Project MearnifyU Team` For Your Support!
