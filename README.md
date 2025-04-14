# Recipe Dashboard API

A comprehensive REST API for the Recipe Dashboard application, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Recipe management (CRUD operations)
- Category management
- Review and rating system
- Favorites system
- Image upload to Cloudinary
- Admin-only routes for user management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/recipe-dashboard
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NODE_ENV=development
   ```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Recipes

- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes` - Get all recipes (with filtering, sorting, and pagination)
- `GET /api/recipes/:slug` - Get a single recipe
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe
- `POST /api/recipes/:id/reviews` - Add a review to a recipe

### Categories

- `POST /api/categories` - Create a new category (admin only)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get a single category
- `PUT /api/categories/:id` - Update a category (admin only)
- `DELETE /api/categories/:id` - Delete a category (admin only)
- `GET /api/categories/:slug/recipes` - Get recipes by category

### Favorites

- `POST /api/favorites/:recipeId` - Add recipe to favorites
- `DELETE /api/favorites/:recipeId` - Remove recipe from favorites
- `GET /api/favorites` - Get user's favorite recipes
- `GET /api/favorites/:recipeId` - Check if recipe is in favorites

### Upload

- `POST /api/upload` - Upload a single image
- `POST /api/upload/multiple` - Upload multiple images

### Admin

- `GET /api/auth/users` - Get all users (admin only)
- `PUT /api/auth/users/:id/role` - Update user role (admin only)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 