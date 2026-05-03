# Team Task Manager

A production-ready full-stack application for managing team projects and tasks with user authentication and role-based access control.

## 🎯 Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Project Management**: Create, read, update, and delete projects
- **Task Management**: Organize tasks within projects with status tracking
- **Dashboard**: Overview of all projects and tasks
- **Role-Based Access**: Admin and Member roles with different permissions
- **Super Admin Seed**: A predefined super admin account is created on startup for full control
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **MongoDB Integration**: Persistent data storage with MongoDB Atlas

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt/Bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **JavaScript** - Client-side logic
- **Vanilla JS** - No framework dependencies for lightweight design

## 📁 Project Structure

```
Ethara.Ai_Project/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── dashboardController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── userController.js    # Admin user management
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   ├── errorHandler.js
│   │   ├── errorMiddleware.js
│   │   ├── roleMiddleware.js   # Role-based access control
│   │   └── validateMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js        # Admin-only user endpoints
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── catchAsync.js
│   │   └── generateToken.js
│   ├── .env                    # Environment variables
│   ├── .env.example            # Example env file
│   ├── package.json
│   └── server.js               # Entry point
├── frontend/
│   ├── components/
│   │   ├── navbar.html
│   │   └── sidebar.html
│   ├── css/
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   ├── main.css
│   │   ├── projects.css
│   │   └── tasks.css
│   ├── js/
│   │   ├── api.js              # API calls
│   │   ├── auth.js             # Authentication logic
│   │   ├── dashboard.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── utils.js
│   └── pages/
│       ├── login.html
│       ├── signup.html
│       ├── dashboard.html
│       ├── projects.html
│       └── tasks.html
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone or extract the project**
```bash
cd Ethara.Ai_Project
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**

The `.env` file is already configured with:
```
PORT=5000
MONGO_URI=mongodb+srv://KanadNetworks:Test1234@kanadnetworks.h52g7kd.mongodb.net/team-task-manager?retryWrites=true&w=majority&appName=KanadNetworks
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=superadmin@teamtaskmanager.com
SUPER_ADMIN_PASSWORD=SuperAdmin@12345
```

**Note**: Ensure your IP address is whitelisted in MongoDB Atlas if using the provided connection string.

### Running the Project

1. **Start the backend server**
```bash
cd backend
npm start
```

The server will start on `http://localhost:5000`

On startup, the backend seeds one super admin account and resets all other existing users to the Member role.

2. **Access the application**
Open your browser and navigate to:
```
http://localhost:5000
```

You'll be redirected to the login page.

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login with email and password

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Users
- `GET /api/users` - List all users (Admin only)
- `PATCH /api/users/:id/role` - Update a user role (Admin only)

## 👤 User Roles

- **Super Admin**: Seeded account with full control over the app
- **Admin**: Can manage projects, tasks, and team members
- **Member**: Can view tasks and update assigned work only

## 🔧 Key Fixes Applied

### Authentication Fix
- **Issue**: Login failed with "Illegal arguments: string, undefined"
- **Cause**: Password field had `select: false` in the User model
- **Solution**: Added `.select('+password')` in the login query to explicitly fetch the password

### Super Admin Seed
- **Issue**: The app needed a fixed admin account and role reset for existing users
- **Solution**: Added a startup seed that creates one super admin and changes all other users to Member

## 📝 Usage Guide

1. **Sign Up**: Create a new account with name, email, and password (min 8 characters)
2. **Login**: Enter your credentials to access the dashboard
3. **Dashboard**: View overview of your projects and tasks
4. **Create Projects**: Add new projects for your team
5. **Manage Tasks**: Organize tasks within projects with status updates
6. **Collaborate**: Share projects with team members

### Super Admin Login
- Email: `superadmin@teamtaskmanager.com`
- Password: `SuperAdmin@12345`
- Use this account for full admin control and member management

## 🐛 Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Verify MongoDB connection string is correct
- Ensure MongoDB Atlas IP whitelist includes your IP

### Can't login
- Make sure password is at least 8 characters
- Verify email address matches signup
- Check browser console for error messages

### Super admin not created yet
- Restart the backend so the startup seed runs again
- Confirm the `.env` file contains `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`

### Frontend not loading
- Clear browser cache (Ctrl+Shift+Del)
- Check if backend server is running
- Verify network connectivity

## 📚 Dependencies

### Backend Dependencies
- `express`: ^4.19.2
- `mongoose`: ^8.4.0
- `jsonwebtoken`: ^9.0.2
- `bcryptjs`: ^3.0.3
- `cors`: ^2.8.5
- `dotenv`: ^16.4.5
- `express-validator`: ^7.2.0

### Dev Dependencies
- `nodemon`: ^3.1.4




