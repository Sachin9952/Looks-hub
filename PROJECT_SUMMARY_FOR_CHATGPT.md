# Looks-Hub: Luxury Salon Booking & Management Platform
## Comprehensive Workflow and Architecture Summary for LLMs/ChatGPT

This document provides a complete, accurate, and up-to-date overview of the **Looks-Hub** project architecture, workflows, database models, and business logic. It includes the recently refactored Customer Booking Lookup System.

---

## 📋 1. PROJECT OVERVIEW & TECH STACK

**Looks-Hub** is a premium unisex salon & academy platform. It is designed to offer a premium, glassmorphic dark-mode customer experience and a complete administration backend.

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, TanStack Router, TanStack Query, Tailwind CSS, Framer Motion, Radix UI (shadcn), Sonner Toast |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose) |
| **Storage & Optimization** | Cloudinary (Multer for file handling, auto-WebP conversion, image cropping, face-aware gravity) |
| **Security** | JWT Auth (Admin), bcrypt (password hashing), IP-based rate limiting, input validation (express-validator) |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---

## 🔄 2. CORE WORKFLOWS

### A. Appointment Booking Flow (Customer)
The booking process uses a type-safe multi-step wizard:
1. **Service Selection**: Services are categorized (Hair, Makeup, Skin, Nails, Grooming). The customer selects a service.
2. **Artist Selection**: The customer selects an artist/stylist or chooses "Any Stylist" (Professional Team).
3. **Date & Time Selection**:
   - Time slots are queried dynamically from `/api/bookings/available-slots`.
   - Displays slots between working hours (default: `09:00` - `18:00`).
   - Standard booking requires at least **2 hours advance notice** (same-day bookings starting within 2 hours are filtered out).
4. **Customer Details**: Customer enters Name, Phone Number, Email, and optional Notes.
   - Saves booking to database, generates a sequential booking reference (`LH-YYYY-XXXXX`), and defaults status to `pending`.

### B. Booking Lookup Flow (Customer)
Refactored to prioritize ease of use (not requiring reference IDs) and secure data retrieval:
1. **Search Form**: The user enters **Customer Name** and **Phone Number**.
2. **Rate Limiting**: Throttled to a maximum of **5 lookup requests per minute per IP** to prevent abuse.
3. **Database Query**: Queries using `Booking.find({ customerName, phone })` with trimmed inputs and a case-insensitive regex for the name.
4. **Security & Enumeration Prevention**: Mismatches and nonexistent names/numbers return a uniform `404` error ("No appointments found..."), preventing attackers from verifying customer data.
5. **No Persistence**: Results are held in transient React state and cleared on page refresh (no `localStorage` or session cache storage).
6. **Result View**: Renders all matched bookings sorted descending by date/time (newest first).

### C. Booking Management (Customer Actions)
From the lookup result view, every appointment card displays its visual tracker, timeline, and actions:
- **Status Journey Tracker**: Displays progress: `Booked` → `Confirmed` → `Completed` (or `Cancelled`).
- **Reschedule**:
  - Requires at least **4 hours advance notice** before the scheduled time.
  - Restricted to a maximum of **2 reschedules** per appointment.
  - Renders slot selection with the same 2-hour advance booking rule for the new time.
- **Cancel**:
  - Cancel is blocked on completed bookings.
  - Updates status to `cancelled` and appends status history.
- **Leave Review**:
  - Permitted only on bookings with `completed` status.
  - Customer can submit a 1-to-5 star rating and feedback text.
- **Timeline**: Expandable list displaying the lifecycle milestones (status changes, timestamps, and who made the change).
- **Countdown**: Shows a live ticker (Days, Hours, Minutes) counting down to the confirmed appointment time.

### D. Admin Management Workflow
1. **Admin Portal**: Authentication via `POST /api/auth/login` returning a JWT token valid for 7 days.
2. **Dashboard Overview**: Displays overall stats (Total bookings, active services, artists) and status distributions.
3. **Enriched Conflict Detection**: Admin booking list highlights scheduling overlaps (conflict flags) where an artist is double-booked on matching date/times.
4. **Admin Booking Overrides**: Admins have bypass privileges to skip:
   - Same-day 2-hour advance booking limit.
   - The customer limit of maximum 3 active appointments.
5. **Entity Management Panels**: Full CRUD panels for Services (price, category, popular toggle), Artists (specialty, experience, profile photo), Testimonials, Gallery elements, and Special Offers.

---

## 🗄️ 3. DATABASE MODELS & SCHEMAS

### **Booking Schema**
Tracks the state of all customer appointments:
```javascript
{
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  service: { type: String, required: true, trim: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  barberId: { type: String, trim: true },
  stylist: { type: String, trim: true },
  userId: { type: String, trim: true },
  price: { type: Number },
  duration: { type: String, trim: true },
  durationMinutes: { type: Number, default: 60 },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:MM
  notes: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  rescheduleCount: { type: Number, default: 0 },
  review: {
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String, trim: true }
  },
  reference: { type: String, unique: true, sparse: true }, // Sequentially generated, e.g. LH-2026-00004
  statusHistory: [
    {
      status: { type: String, required: true },
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: String, required: true }
    }
  ]
}
```

### **Service Schema**
Defines salon offerings:
```javascript
{
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true }, // Hair, Makeup, Skin, Nails, Grooming
  price: { type: Number, required: true },
  duration: { type: String, required: true }, // e.g. "45 Min"
  description: { type: String, trim: true },
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}
```

### **Artist/Stylist Schema**
Stylist profiles with experience and ratings:
```javascript
{
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  years: { type: Number, required: true },
  rating: { type: Number, default: 5.0 },
  imageUrl: { type: String },
  imagePublicId: { type: String }
}
```

---

## 📡 4. SYSTEM API ARCHITECTURE

### Auth Route (`/api/auth`)
- `POST /login` - Admin authentication (Returns JWT)
- `GET /me` - Validates JWT and returns current Admin profile
- `POST /register-admin` - Instantiates new admin accounts

### Bookings Route (`/api/bookings`)
- `POST /lookup` - Secure customer lookup endpoint. Requires `customerName` and `phone`. Returns all matches sorted descending. Throttled via `lookupRateLimiter`.
- `POST /` - Creates new booking. Enforces 2-hour advance booking and max 3 active bookings limit rules for clients.
- `GET /` - Queries all bookings. Accessible only by Authenticated Admins.
- `GET /available-slots` - Calculates working slot availability for dates/artists.
- `PATCH /reschedule` - Updates date/time. Validates notice timeframe and maximum reschedule count constraints.
- `PATCH /cancel` - Customer cancellation. Updates status and timeline.
- `POST /review` - Logs rating and reviews on completed appointments.
- `PATCH /:id/status` - Updates booking status (Admin privilege).
- `DELETE /:id` - Deletes booking document (Admin privilege).

---

## 🎨 5. FRONTEND PAGE DIRECTORY MAP

| Route | Component | Purpose |
|---|---|---|
| `/` | Landing Page | Hero section, featured reviews, popular services, salon location, sticky contacts |
| `/services` | Services Catalog | Browsable list of categories and salon pricing |
| `/book` | Booking System | Multi-step appointment wizard |
| `/account/bookings` | Bookings Lookup | Customer lookup portal (Customer Name + Phone) with active card displays |
| `/admin/login` | Login Portal | Admin credential forms |
| `/admin/dashboard` | Admin Portal | Live statistics graphs, management tables (CRUD artists, services, testimonials) |

---

## 🛡️ 6. APPLIED SECURITY RULES

1. **Throttling**: Public lookup router has a memory cache rate limiter preventing brute-forcing names/phones by limiting lookup requests to 5 per minute per IP.
2. **Enumeration Mitigation**: If lookup returns no matches, the API returns a generic 404 block preventing database discovery (no disclosure of name or phone validity).
3. **Admin Bearer Protection**: Sensitive endpoints (bookings query, service modifications, artist deletion) require valid Authorization Headers containing Bearer JWT tokens.
4. **CORS Safeguards**: CORS headers restricted to verified domains in production and local development environments.
