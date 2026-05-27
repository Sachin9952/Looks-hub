# Maison Lumière - Client

Luxury salon frontend built with **React 19**, **TanStack Start**, **Vite**, and **Tailwind CSS**.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📦 Tech Stack

- **React 19** - Latest React with server components support
- **TanStack Start** - Full-stack framework (SSR + client)
- **TanStack Router** - Type-safe, file-based routing
- **Vite 7** - Lightning-fast build tool
- **Tailwind CSS 4** - Modern utility-first CSS
- **Radix UI** - 45+ accessible, unstyled components
- **TypeScript 5** - Type-safe development
- **Framer Motion** - Smooth animations
- **React Hook Form + Zod** - Form validation
- **Recharts** - Charts & analytics
- **Sonner** - Toast notifications
- **Lucide React** - Beautiful icons

## 📁 Folder Structure

```
src/
├── components/
│   ├── site/              # Page sections (Hero, Gallery, etc.)
│   ├── ui/                # Radix-based reusable components
│   ├── booking/           # Booking page components
│   ├── dashboard/         # Admin dashboard
│   └── common/            # Navigation, Footer, etc.
├── routes/                # TanStack Router file-based pages
├── lib/                   # Utilities, helpers, data
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
├── styles/                # Global CSS
├── assets/                # Images, icons, videos
└── main.tsx              # Entry point
```

## 🎨 Design Features

- **Luxury Aesthetic**: Premium salon branding
- **Smooth Animations**: Framer Motion transitions
- **Dark/Light Support**: Tailwind CSS theming
- **Responsive**: Mobile-first design
- **Accessible**: WCAG compliant components

## 🔗 Routes

- `/` - Home (Hero, Services, Gallery, Testimonials, etc.)
- `/book` - Appointment booking
- `*` - 404 Not Found

## ⚙️ Configuration

### Environment Variables

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Vite Config

- **Powered by**: `@lovable.dev/vite-tanstack-config`
- **Features**: Auto path aliasing, React optimization, Tailwind, Cloudflare support

### TypeScript Paths

```json
{
  "@/*": ["./src/*"]
}
```

Use imports like:
```ts
import { Hero } from "@/components/site/Hero"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

## 📝 Scripts

```bash
npm run dev        # Development server with HMR
npm run build      # Production build for Cloudflare
npm run preview    # Preview production build locally
npm run lint       # Lint with ESLint
npm run format     # Format with Prettier
```

## 🎯 Key Components

### Home Page (`src/routes/index.tsx`)
- Navigation
- Hero section
- Services showcase
- Gallery
- Artists directory
- Pricing
- Testimonials
- Sticky CTA buttons

### Booking Page (`src/routes/book.tsx`)
- Service selection
- Stylist selection
- Time slot picker
- Booking confirmation

### UI Components (`src/components/ui/`)
Radix-based components with Tailwind styling:
- Buttons, Cards, Dialogs
- Forms, Inputs, Selects
- Alerts, Badges, Tabs
- Dropdowns, Menus, Popovers
- And 40+ more...

## 🚀 Deployment

### Cloudflare Workers

```bash
npm run build
wrangler publish
```

### Vercel / Netlify

```bash
npm run build
# Deploy `dist/` folder
```

## 📚 Resources

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Radix UI Docs](https://www.radix-ui.com)
- [Framer Motion Docs](https://www.framer.com/motion)

## 🔐 Security

- All API calls use `VITE_API_URL` from environment
- Form validation with Zod schema
- No sensitive data in client code
- JWT tokens in secure HTTP-only cookies (backend)

## 🐛 Troubleshooting

**Port 5173 already in use?**
```bash
npm run dev -- --port 3000
```

**Types not resolving?**
```bash
npm run build  # TypeScript checks
```

**Styling issues?**
```bash
# Clear Vite cache
rm -rf .vite
npm run dev
```
