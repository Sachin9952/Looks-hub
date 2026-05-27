# Salon Website - Maison Lumière

A full-stack salon booking and management system featuring a luxury salon experience with a modern React 19 frontend (TanStack Start) and Express/MongoDB backend.

## Project Structure

```
salon-website/
├── client/          # React 19 + Vite + TanStack Router + Tailwind
└── server/          # Node.js + Express + MongoDB backend
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ (tested with v18+)
- **npm** (or yarn/bun)
- **MongoDB** (local or Atlas connection string)
- **Cloudinary** account (for image uploads)

### Installation & Running

#### Option 1: Run Both Client & Server Together (Recommended)

```bash
# From salon-website root:
npm run install-all    # Install all dependencies
npm run dev            # Runs both client and server concurrently
```

#### Option 2: Run Separately

**Terminal 1 - Frontend:**
```bash
cd salon-website/client
npm install
npm run dev
```
Frontend: `http://localhost:5173`

**Terminal 2 - Backend:**
```bash
cd salon-website/server
npm install
npm run dev
```
Backend: `http://localhost:5000`

### Environment Setup

1. **Client** - Create `salon-website/client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

2. **Server** - Create `salon-website/server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/salon_website
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

## ✨ Features

- **Luxury Salon Experience**: Premium, professionally designed interface
- **Appointment Booking**: TanStack Router-based booking system
- **Service Gallery**: Showcase salon services with images
- **Artist Directory**: Display stylist profiles
- **Testimonials**: Customer reviews and ratings
- **Admin Dashboard**: Manage bookings and view analytics
- **Responsive Design**: Mobile-optimized, modern UI
- **Form Handling**: React Hook Form + Zod validation
- **Data Visualization**: Recharts for analytics
- **Toast Notifications**: Sonner for user feedback

## 📦 Tech Stack

### Frontend
- **React 19** with TypeScript
- **TanStack Start** (full-stack framework)
- **TanStack Router** (file-based routing)
- **Vite 7** (build tool)
- **Tailwind CSS 4**
- **Radix UI** (45+ accessible components)
- **Framer Motion** (animations)
- **React Hook Form** + **Zod** (validation)
- **Recharts** (charts & analytics)
- **Lucide React** (icons)

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** (authentication)
- **Bcryptjs** (password hashing)
- **Cloudinary** (image management)
- **Multer** (file uploads)
- **CORS** (cross-origin requests)

## 📁 Directory Structure

```
salon-website/
├── client/
│   ├── src/
│   │   ├── components/        # UI & page components
│   │   │   ├── site/         # Homepage sections
│   │   │   └── ui/           # Radix-based components
│   │   ├── routes/           # TanStack Router pages
│   │   ├── lib/              # Utilities & helpers
│   │   ├── styles/           # Global styles
│   │   ├── assets/           # Images & media
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static files
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/           # Database & Cloudinary config
│   │   ├── controllers/      # Route handlers
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── services/         # Business logic
│   │   └── server.js         # Entry point
│   ├── uploads/              # File storage (local)
│   ├── package.json
│   └── .env.example
│
└── package.json              # Root monorepo config
```

## 🔧 Available Commands

### Client
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Lint code
npm run format     # Format code with Prettier
```

### Server
```bash
npm run dev        # Development with auto-reload (nodemon)
npm start          # Production
```

### Root (Monorepo)
```bash
npm run dev        # Run both client & server
npm run build      # Build both client & server
npm run install-all # Install dependencies for all
```

## 🔐 Security Notes

- JWT tokens expire after 7 days (configurable)
- Passwords are hashed with bcryptjs
- CORS is configured for development
- Environment variables are required for sensitive data
- Update JWT_SECRET in production

## 🚀 Deployment

### Client (Cloudflare Workers Ready)
The client is configured for **Cloudflare Workers** deployment:
```bash
npm run build
wrangler publish
```

### Server
Deploy to any Node.js hosting (Heroku, Render, DigitalOcean, AWS, etc.)

## 📝 License

MIT
