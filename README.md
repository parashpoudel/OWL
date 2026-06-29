# OWL Community Platform - Backend Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or use MongoDB Atlas cloud)
- npm or yarn

## Installation

### 1. Install Dependencies
```bash
cd /Users/prexismarvel/Desktop/3D
npm install
```

### 2. Configure Environment Variables
Edit the `.env` file with your MongoDB credentials:

```
MONGODB_URI=mongodb://localhost:27017/owl-community
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
```

**Note:** For production, use MongoDB Atlas or another cloud MongoDB service and update `MONGODB_URI`.

### 3. Start MongoDB
If using local MongoDB:
```bash
mongod
```

If using MongoDB Atlas, skip this step (ensure connection string is in `.env`).

### 4. Start the Server
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user (admin only)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires token)
- `GET /api/auth/users` - Get all users (admin only)

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get single blog
- `POST /api/blogs` - Create blog (authenticated users)
- `PUT /api/blogs/:id` - Update blog (blog author only)
- `DELETE /api/blogs/:id` - Delete blog (author or admin)
- `POST /api/blogs/:id/like` - Like/unlike blog
- `POST /api/blogs/:id/comment` - Add comment to blog

## User Workflow

### Admin
1. Navigate to `/admin`
2. Login with admin credentials
3. Create user accounts by providing username, email, password, and role
4. Users receive their credentials and can login

### Regular Users
1. Navigate to `/login`
2. Enter credentials provided by admin
3. Access `/blogs` to view and create blog posts
4. Post expeditions with photos and stories

## File Structure
```
/
├── server.js                # Main Express server
├── package.json             # Dependencies
├── .env                     # Environment variables
├── models/
│   ├── User.js              # User schema
│   └── Blog.js              # Blog schema
├── routes/
│   ├── auth.js              # Authentication routes
│   └── blogs.js             # Blog routes
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── index.html               # Main homepage
├── login.html               # Login page
├── blogs.html               # Blogs page
├── admin.html               # Admin panel
├── script.js                # Frontend scripts
└── styles.css               # Styling
```

## Database Schema

### User
- username (unique)
- email (unique)
- password (hashed)
- isAdmin (boolean)
- createdAt (date)

### Blog
- title
- description
- content
- author (reference to User)
- authorName
- images (array with url and caption)
- tags (array)
- likes (array of user references)
- comments (array)
- createdAt & updatedAt (dates)

## Default Admin Creation

To create the first admin user:
1. Temporarily modify `routes/auth.js` to allow registration without authentication
2. Or manually insert into MongoDB:

```javascript
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "bcrypt_hashed_password",
  isAdmin: true,
  createdAt: new Date()
})
```

## API Usage Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Blog
```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My Adventure",
    "description": "Amazing journey",
    "content": "Full story...",
    "authorName": "username",
    "tags": ["mountain", "trek"]
  }'
```

## Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`

**CORS Errors**
- Ensure frontend is accessing API correctly
- Check if `cors` middleware is configured

**JWT Token Errors**
- Token may be expired (7 days default)
- Ensure `JWT_SECRET` matches in `.env`

## Security Notes
- Change `JWT_SECRET` to a secure random string in production
- Use HTTPS in production
- Validate all input on backend
- Implement rate limiting for production
- Use MongoDB Atlas or secure MongoDB instance in production
