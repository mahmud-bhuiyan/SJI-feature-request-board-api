# Feature Request Board API Documentation

Welcome to the Feature Request Board API documentation. This API is implemented using Node.js, Express.js and MongoDB, providing functionality for managing feature requests.

## Introduction

This Feature Request Board API is designed to help you efficiently organize and track feature requests. It leverages Node.js for server-side logic, Express.js for routing, and MongoDB for data storage.

## Accessing the Feature Request Board

To access the Feature Request Board, visit [Feature Request Board Live Link](https://mahmud-feature-request-board.vercel.app/).

visit [Frontend git link](https://github.com/mahmud-bhuiyan/SJI-feature-request-board.git).

## App Details

The project revolves around a feature board management system designed to streamline feature requests, updates, and management within a web application. Its primary goals include:

1.  **Feature Request Management:**

    - Allow users to submit feature requests or suggestions through a dedicated platform.
    - Enable administrators to review, update, and prioritize these requests.

2.  **Dashboard for Administrators:**

    - Provide a user-friendly dashboard for administrators to manage feature requests efficiently.
    - Allow administrators to update feature details such as title, description, status, and sorting order.

3.  **Enhanced User Experience:**

    - Improve user experience by offering a centralized platform for users to submit, track, and engage with feature requests.

4.  **Efficient Organization and Prioritization:**

    - Facilitate effective organization and prioritization of feature requests based on status, user feedback, and importance.

5.  **Configuration and Flexibility:**

    - Allows administrators to update the web app's logo, description, and other essential details easily.

The primary focus is on creating a feature-rich, user-centric platform that empowers both users and administrators, streamlining the process of handling feature requests while enhancing overall user experience and product development.

## Prerequisites

- Node.js and npm installed on your machine
- MongoDB(Mongoose) installed

## Installation And Usage

Follow these steps to set up and run the project:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mahmud-bhuiyan/SJI-feature-request-board-apir.git
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

### Additional Tips:

- Verify that MongoDB is running and accessible with the provided URI.
- Make sure the MongoDB driver (Mongoose) is correctly installed.
- Check for any errors or warnings displayed in the console during server startup.
- Test API endpoints to ensure the backend functions as expected.

This setup process assumes you've already set up Node.js, MongoDB, and have access to the required credentials. Adjust the steps according to your specific environment and project structure.

### **Check Health**

```http
GET /health
```

## Feature API Documentation

The Feature API is designed to manage feature requests, allowing users to perform CRUD operations and search for specific features. This documentation outlines the available endpoints and their functionalities.

## Base URL for Features

The base URL for accessing the Feature API is `/api/v1/features`.

## Endpoints

### Create Feature Requests

- URL: `/`
- Method: `POST`
- Description: Creates a new feature based on provided request body. Only authenticated users can create a new request.
  - Request Body: JSON object representing the new feature.
  - Response: Returns a success message upon successful creation.

### Get All Feature Requests

- URL: `/`
- Method: `GET`
- Description: Retrieves all features with optional sorting and filtering options.

  - Query Parameters:
    - `sortBy`: Field to sort by (default: `createdAt`)
    - `order`: Sort order (`asc` or `desc`, default: `desc`)
    - `status`: Filters features by status
  - Response: Returns a JSON object containing an array of features.

### Search Feature Request

- URL: `/search/:searchTerm`
- Method: `GET`
- Description: Searches for features based on provided search queries in titles or descriptions.
  - Query Parameters:
    - `searchTerm`: Search query string
  - Response: Returns a JSON object containing an array of features matching the search query.

### Get Feature Request By ID

- URL: `/:id`
- Method: `GET`
- Description: Retrieves details of a specific feature by its ID.
  - Params:
    - `id`: Feature ID
  - Response: Returns a JSON object containing the feature details.

### Update Feature Request By ID

- URL: `/:id/update`
- Method: `PATCH`
- Description: Updates an existing feature by its ID with provided request body data.
  - Params:
    - `id`: Feature ID
  - Request Body: JSON object containing updated feature data.
  - Response: Returns a JSON object containing the updated feature details.

### Delete Feature Request By ID

- URL: `/:id`
- Method: `DELETE`
- Description: Deletes a feature by its ID.
  - Params:
    - `id`: Feature ID
  - Response: Returns a JSON object containing the deleted feature details.

### Soft Delete Feature Request By ID (Admin Protected Route)

- URL: `/:id`
- Method: `PATCH`
- Description: Soft Delete a feature by its ID from admin panel.
  - Params:
    - `id`: Feature ID
  - Response: Returns a JSON object containing the soft deleted feature details.

### Update Feature Request Status By ID (Admin Protected Route)

- URL: `/:id/status`
- Method: `PATCH`
- Description: Updates an existing features status by its ID.
  - Params:
    - `id`: Feature ID
  - Request Body: JSON object containing updated features status.
  - Response: Returns a JSON object containing the updated feature details.

### Like Feature Request

- URL: `/:id/like`
- Method: `PATCH`
- Description: Allows users to like a feature by its ID.
  - Params:
    - `id`: Feature ID
  - Request Body: JSON object containing `id` to track likes.
  - Response: Returns a JSON object containing the updated feature details.

### Unlike Feature Request

- URL: `/:id/unlike`
- Method: `PATCH`
- Description: Allows users to unlike feature by its ID.
  - Params:
    - `id`: Feature ID
  - Request Body: JSON object containing `id` to track unlike.
  - Response: Returns a JSON object containing the updated feature details.

## Comment API Documentation

The Comment API manages comments associated with features, allowing users to add, retrieve, and delete comments.

## Base URL

The base URL for accessing the Comment API is `/api/v1/features/:featureId/comments`.

## Endpoints

### Create a new comment in Feature Request

- URL: `/`
- Method: `PATCH`
- Description: Creates a new comment and associates it with a specific feature.
  - Request Body: JSON object representing the new comment. Should include `featureId` to associate with the feature.
  - Response: Returns a success message and the created comment upon successful creation.

### Delete Comments from Feature Request

- URL: `/:commentId`
- Method: `DELETE`
- Description: Deletes a specific comment associated with a feature by its ID.
  - Params:
    - `featureId`: ID of the feature the comment is associated with.
    - `commentId`: ID of the comment to be deleted.
  - Response: Returns a JSON object containing the deleted comment details.

### Update Comments from Feature Request

- URL: `/:commentId`
- Method: `PATCH`
- Description: Updates an existing Comment by its ID with provided request body data.
  - Params:
    - `commentId`: Comment ID
  - Request Body: JSON object containing updated Comment data.
  - Response: Returns a JSON object containing the updated Comment details.

## Website API Documentation

The App Information API manages information related to the application, allowing retrieval, creation, and updating of app details.

## Base URL

The base URL for accessing the App Information API is `/api/v1/website`.

## Endpoints

- Only admin can do this

### Get Website Information

- **URL:** `/`
- **Method:** `GET`
- **Description:** Retrieves information about the app.
  - **Response:** Returns a JSON object containing app information.

### Update Website Information (Admin Protected Route)

- **URL:** `/`
- **Method:** `PATCH`
- **Description:** Updates existing app information.
  - **Request Body:** JSON object containing updated app information.
  - **Response:** Returns a success message and the updated app information upon successful update.

### Update Website Image (Admin Protected Route)

- **URL:** `/upload`
- **Method:** `PATCH`
- **Description:** Updates existing apps image by ID.
  - **Request Body:** JSON object containing updated image information.
  - **Response:** Returns a success message and the updated app information upon successful update.

## User API Documentation

The User API manages user-related operations, allowing users to be created, retrieved, updated, and deleted.

## Base URL

The base URL for accessing the User API is `/api/v1/users`.

## Endpoints

### Get user Information

- URL: `/me`
- Method: `GET`
- Description: Retrieves details of a specific user by ID.
  - Response: Returns a JSON object containing the details of the requested user.

### Login user

- URL: `/login`
- Method: `POST`
- Description: Login user.
  - Request Body: JSON object passes with users details.
  - Response: Returns a success message upon successful user details.

### Register user

- URL: `/register`
- Method: `POST`
- Description: Creates a new user.
  - Request Body: JSON object representing the new user.
  - Response: Returns a success message upon successful user creation.

### Google signin user

- URL: `/google-signin`
- Method: `POST`
- Description: Creates a new user using firebase.
  - Request Body: JSON object representing the new user.
  - Response: Returns a success message upon successful user creation.

## Admin API Documentation

The Admin API manages admin-related operations, allowing users to be updated as admin, retrieved and soft delete user.

## Base URL

The base URL for accessing the User API is `/api/v1/admins`.

## Endpoints

### Get all users details

- URL: `/`
- Method: `GET`
- Description: Retrieves all users and admins.
  - Response: Returns a JSON object containing an array of users.

### Soft Delete User By ID

- URL: `/:id`
- Method: `PATCH`
- Description: Soft Delete a user by its ID from admin panel.
  - Params:
    - `id`: User ID
  - Response: Returns a JSON object containing the soft deleted users details.

### Make User an Admin By ID

- URL: `/make-admin/:id`
- Method: `PATCH`
- Description: make an user an admin using ID.
  - Params:
    - `id`: User ID
  - Response: Returns a JSON object containing the updated users details.

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
