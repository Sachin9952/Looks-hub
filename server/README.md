# Salon Website - Server

Express.js + MongoDB + Cloudinary backend for the luxury salon booking system.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

## 📦 Tech Stack

- **Node.js** + **Express.js** - REST API server
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** - JSON Web Token authentication
- **Bcryptjs** - Password hashing
- **Cloudinary** - Image/video management
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management
- **Nodemon** - Auto-reload in development

## ⚙️ Configuration

### Environment Variables

Create `.env` file (copy from `.env.example`):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/salon_website
# or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/salon_website

# JWT
JWT_SECRET=your_secure_random_string_here_min_32_chars
JWT_EXPIRE=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client
CLIENT_URL=http://localhost:5173
```

### Get Credentials

1. **MongoDB**:
   - Local: Use `mongodb://localhost:27017/salon_website`
   - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Cloudinary**:
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Get API credentials from dashboard

3. **JWT_SECRET**:
   ```bash
   # Generate secure secret:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## 📁 Folder Structure

```
src/
├── config/
│   ├── db.js              # MongoDB connection
│   └── cloudinary.js      # Cloudinary setup
├── controllers/           # Request handlers
│   ├── authController.js
│   ├── bookingController.js
│   ├── serviceController.js
│   ├── galleryController.js
│   └── dashboardController.js
├── models/               # Mongoose schemas
│   ├── Admin.js
│   ├── Booking.js
│   ├── Service.js
│   ├── Gallery.js
│   ├── Testimonial.js
│   └── Offer.js
├── routes/              # API endpoints
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── serviceRoutes.js
│   ├── galleryRoutes.js
│   └── dashboardRoutes.js
├── middleware/          # Custom middleware
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   ├── uploadMiddleware.js
│   └── validateMiddleware.js
├── services/            # Business logic
│   ├── cloudinaryService.js
│   ├── analyticsService.js
│   └── bookingService.js
├── utils/              # Helper functions
│   ├── generateToken.js
│   ├── asyncHandler.js
│   └── responseHandler.js
├── validations/        # Input validation
│   ├── bookingValidation.js
│   └── authValidation.js
├── app.js             # Express app setup
└── server.js          # Entry point
```

## 📝 Scripts

```bash
npm run dev        # Development (with nodemon auto-reload)
npm start          # Production
npm run build      # Install dependencies
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register        # Create account
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
POST   /api/auth/refresh-token   # Refresh JWT
```

### Bookings
```
GET    /api/bookings             # Get all bookings (admin)
GET    /api/bookings/:id         # Get booking details
POST   /api/bookings             # Create booking
PUT    /api/bookings/:id         # Update booking
DELETE /api/bookings/:id         # Cancel booking
```

### Services
```
GET    /api/services             # Get all services
GET    /api/services/:id         # Get service details
POST   /api/services             # Create service (admin)
PUT    /api/services/:id         # Update service (admin)
DELETE /api/services/:id         # Delete service (admin)
```

### Gallery
```
GET    /api/gallery              # Get gallery images
POST   /api/gallery              # Upload image (admin)
DELETE /api/gallery/:id          # Delete image (admin)
```

### Dashboard
```
GET    /api/dashboard/stats      # Dashboard statistics
GET    /api/dashboard/analytics  # Analytics data
```

## 🔐 Middleware

### Auth Middleware
- Verifies JWT token
- Extracts user info
- Handles token expiration

### Error Middleware
- Centralized error handling
- Consistent error responses
- Development vs production modes

### Upload Middleware
- File size validation
- Type checking
- Multer integration

### Validation Middleware
- Request body validation
- Query parameter checks
- Zod/Joi schemas

## 📦 Key Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT auth
- `bcryptjs` - Password hashing
- `cloudinary` - Image service
- `multer` - File uploads
- `cors` - Cross-origin requests
- `dotenv` - Environment config
- `express-async-handler` - Async error handling
- `nodemon` - Dev auto-reload

## 🚀 Development Workflow

1. **Create `.env`** file with required credentials
2. **Start MongoDB** (local or connect to Atlas)
3. **Run**: `npm run dev`
4. **Test endpoints** with Postman or VS Code REST Client

## 🧪 Testing

Create `.rest` file for testing:

```rest
### Get all services
GET http://localhost:5000/api/services

### Create booking
POST http://localhost:5000/api/bookings
Content-Type: application/json

{
  "serviceId": "...",
  "artistId": "...",
  "date": "2025-06-15",
  "time": "10:00"
}

### Health check
GET http://localhost:5000/api/health
```

## 🚀 Deployment

### Heroku
```bash
git push heroku main
```

### Render.com / Railway.app
1. Connect GitHub repo
2. Set environment variables
3. Deploy

### AWS / DigitalOcean / Linode
- Use PM2 for process management
- Set up Nginx as reverse proxy
- Configure SSL/TLS

## 🐛 Troubleshooting

**MongoDB Connection Error?**
- Verify `MONGODB_URI` is correct
- Check IP whitelist (if using Atlas)
- Ensure MongoDB is running (locally)

**Cloudinary Upload Fails?**
- Verify credentials in `.env`
- Check file size limits
- Ensure folder permissions

**Port 5000 Already in Use?**
```bash
# Change port:
PORT=5001 npm run dev
```

**JWT Token Errors?**
- Generate new `JWT_SECRET`
- Ensure token is sent in Authorization header
- Check token expiration

## 📚 Resources

- [Express.js Docs](https://expressjs.com)
- [Mongoose Docs](https://mongoosejs.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [JWT.io](https://jwt.io)

## 📄 License

MIT
