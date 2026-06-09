import { useState, useEffect, useMemo, useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Star,
  MessageCircle,
  CalendarPlus,
  RotateCcw,
  Search,
  BookOpen,
  Loader2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserX,
  Ban,
  RefreshCw,
  Phone
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/account/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings · Look's Hub" },
      { name: "description", content: "Manage your upcoming appointments and history at Look's Hub Unisex Salon." },
    ],
  }),
  component: BookingsDashboard,
});

interface Booking {
  _id: string;
  reference?: string;
  statusHistory?: Array<{
    status: string;
    changedAt: string;
    changedBy: string;
  }>;
  customerName: string;
  phone: string;
  email?: string;
  service: string;
  serviceId?: string;
  barberId?: string;
  stylist?: string;
  price?: number;
  duration?: string;
  durationMinutes?: number;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled_by_user" | "cancelled_by_salon" | "rejected" | "expired" | "no_show";
  _originalStatus?: string;
  createdAt: string;
  rescheduleCount?: number;
  review?: {
    rating: number;
    feedback: string;
  };
}

// ─── Configurable Business Rules (must match backend) ────────
const ALLOW_CANCEL_UNTIL_HOURS = 1;
const ALLOW_RESCHEDULE_UNTIL_HOURS = 2;

// ─── Centralized Remaining Time Utility ──────────────────────
interface RemainingTime {
  days: number;
  hours: number;
  minutes: number;
  totalMinutes: number;
  isExpired: boolean;
  label: string;
}

const getRemainingTime = (dateStr: string, timeStr: string): RemainingTime => {
  const target = new Date(`${dateStr}T${timeStr}:00+05:30`);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, totalMinutes: 0, isExpired: true, label: "" };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return { days, hours, minutes, totalMinutes, isExpired: false, label: parts.join(" ") + " remaining" };
};

// Helper: check if a booking's appointment time is in the past
const isAppointmentPast = (booking: Booking): boolean => {
  const apptTime = new Date(`${booking.date}T${booking.time}:00+05:30`);
  return apptTime.getTime() < Date.now();
};

// Helper: check if a booking status is "cancelled" (either variant)
const isCancelledStatus = (status: string): boolean =>
  status === "cancelled_by_user" || status === "cancelled_by_salon";

// Helper: check if a booking can be cancelled (within cancellation window)
const canCancelBooking = (booking: Booking): boolean => {
  const isActive = booking.status === "pending" || booking.status === "confirmed";
  if (!isActive) return false;
  const remaining = getRemainingTime(booking.date, booking.time);
  return !remaining.isExpired && (remaining.totalMinutes / 60) >= ALLOW_CANCEL_UNTIL_HOURS;
};

// Helper: check if a booking can be rescheduled (within reschedule window)
const canRescheduleBooking = (booking: Booking): boolean => {
  const isActive = booking.status === "pending" || booking.status === "confirmed";
  if (!isActive) return false;
  if ((booking.rescheduleCount || 0) >= 2) return false;
  const remaining = getRemainingTime(booking.date, booking.time);
  return !remaining.isExpired && (remaining.totalMinutes / 60) >= ALLOW_RESCHEDULE_UNTIL_HOURS;
};

// Helper: check if a booking can still be acted on (cancel or reschedule)
const isActionable = (booking: Booking): boolean => {
  const isActive = booking.status === "pending" || booking.status === "confirmed";
  return isActive && !isAppointmentPast(booking);
};

// Helper: client-side status evaluator for real-time auto-expiry
const evaluateClientStatus = (booking: Booking): Booking["status"] => {
  const status = booking.status;
  // Terminal statuses never change
  if (status !== "pending" && status !== "confirmed") return status;

  const remaining = getRemainingTime(booking.date, booking.time);
  if (status === "pending" && remaining.isExpired) return "expired";
  if (status === "confirmed" && remaining.isExpired) {
    // Grace: check if service end time has also passed
    const durationMins = booking.durationMinutes || 60;
    const endRemaining = getRemainingTime(booking.date, booking.time);
    if (endRemaining.totalMinutes + durationMins <= 0) return "no_show";
    // More precise: compute from end time
    const startMs = new Date(`${booking.date}T${booking.time}:00+05:30`).getTime();
    const endMs = startMs + durationMins * 60 * 1000;
    if (Date.now() > endMs) return "no_show";
  }
  return status;
};

// 3. CUSTOMER FRIENDLY STATUS LABELS
const getFriendlyStatusLabel = (status: string) => {
  const mapping: Record<string, string> = {
    pending: "Awaiting Confirmation",
    confirmed: "Appointment Confirmed",
    completed: "Service Completed",
    cancelled_by_user: "Cancelled by You",
    cancelled_by_salon: "Cancelled by Salon",
    rejected: "Booking Rejected",
    expired: "Booking Expired",
    no_show: "Appointment Missed"
  };
  return mapping[status] || status;
};

// 9. PREMIUM STATUS ICONS
const StatusIcon = ({ status, size = 14 }: { status: string; size?: number }) => {
  switch (status) {
    case "pending":
      return <Clock size={size} className="text-amber-500 animate-pulse" />;
    case "confirmed":
      return <CheckCircle size={size} className="text-emerald-500" />;
    case "completed":
      return <Sparkles size={size} className="text-[color:var(--gold)]" />;
    case "cancelled_by_user":
    case "cancelled_by_salon":
      return <XCircle size={size} className="text-red-500" />;
    case "rejected":
      return <Ban size={size} className="text-red-500" />;
    case "expired":
      return <AlertTriangle size={size} className="text-orange-500" />;
    case "no_show":
      return <UserX size={size} className="text-red-500" />;
    default:
      return null;
  }
};

// 1. DYNAMIC VISUAL JOURNEY TRACKER
const VisualJourneyTracker = ({ status }: { status: string }) => {
  // Define steps based on actual booking lifecycle
  const getSteps = () => {
    if (isCancelledStatus(status)) {
      return [
        { label: "Booked", completed: true, failed: false },
        { label: "Cancelled", completed: true, failed: true },
      ];
    }
    if (status === "rejected") {
      return [
        { label: "Booked", completed: true, failed: false },
        { label: "Rejected", completed: true, failed: true },
      ];
    }
    if (status === "expired") {
      return [
        { label: "Booked", completed: true, failed: false },
        { label: "Expired", completed: true, failed: true },
      ];
    }
    if (status === "no_show") {
      return [
        { label: "Booked", completed: true, failed: false },
        { label: "Confirmed", completed: true, failed: false },
        { label: "Missed", completed: true, failed: true },
      ];
    }
    // Normal flow: Booked → Pending → Completed
    return [
      { label: "Booked", completed: true, failed: false },
      { label: status === "pending" ? "Pending" : "Confirmed", completed: status === "confirmed" || status === "completed", failed: false },
      { label: "Completed", completed: status === "completed", failed: false },
    ];
  };

  const steps = getSteps();
  const hasFailed = steps.some(s => s.failed);

  // For 2-step timelines (cancelled, rejected, expired)
  if (steps.length === 2) {
    return (
      <div className="mt-6 pt-4 border-t border-[color:var(--charcoal)]/5 flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-[color:var(--gold)]">
          <span className="w-5 h-5 rounded-full bg-[color:var(--gold)]/10 text-[color:var(--gold)] flex items-center justify-center text-[10px]">✓</span>
          <span>{steps[0].label}</span>
        </div>
        <div className={`h-[2px] w-8 ${steps[1].failed ? 'bg-red-500/20' : 'bg-[color:var(--gold)]/20'}`} />
        <div className={`flex items-center gap-2 text-xs font-semibold ${steps[1].failed ? 'text-red-500' : 'text-[color:var(--gold)]'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            steps[1].failed ? 'bg-red-500/10 text-red-500' : 'bg-[color:var(--gold)]/10 text-[color:var(--gold)]'
          }`}>{steps[1].failed ? '✕' : '✓'}</span>
          <span>{steps[1].label}</span>
        </div>
      </div>
    );
  }

  // For 3-step timelines
  // Calculate progress width
  const lastCompletedIdx = [...steps].reverse().findIndex(s => s.completed);
  const completedUpTo = lastCompletedIdx >= 0 ? steps.length - 1 - lastCompletedIdx : -1;
  const progressPercent = completedUpTo <= 0 ? "0%" : completedUpTo === 1 ? "33.33%" : "66.67%";

  return (
    <div className="mt-6 pt-4 border-t border-[color:var(--charcoal)]/5 w-full">
      <div className="relative flex justify-between items-start w-full max-w-md mx-auto pt-1">
        {/* Connecting line background */}
        <div className="absolute top-[11px] left-[16.67%] right-[16.67%] h-[2.5px] bg-[color:var(--charcoal)]/10 rounded-full -z-0" />
        
        {/* Connecting line active fill */}
        <div
          className={`absolute top-[11px] left-[16.67%] h-[2.5px] rounded-full transition-all duration-700 ease-out -z-0 ${
            hasFailed ? 'bg-red-500' : 'bg-[color:var(--gold)]'
          }`}
          style={{ width: progressPercent }}
        />

        {steps.map((stepVal) => (
          <div key={stepVal.label} className="flex flex-col items-center flex-1 text-center relative z-10">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-500 ${
                stepVal.failed
                  ? "bg-red-500 text-white shadow-sm"
                  : stepVal.completed 
                    ? "bg-[color:var(--gold)] text-black shadow-sm" 
                    : "border border-[color:var(--charcoal)]/20 text-[color:var(--charcoal)]/40 bg-[color:var(--cream)]"
              }`}
            >
              {stepVal.failed ? "✕" : stepVal.completed ? "✓" : "○"}
            </div>
            <span className={`text-[10px] sm:text-xs uppercase tracking-wider font-semibold mt-2 transition-colors duration-500 ${
              stepVal.failed ? "text-red-500" :
              stepVal.completed ? "text-[color:var(--charcoal)]" : "text-[color:var(--charcoal)]/40"
            }`}>
              {stepVal.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. STATUS INFORMATION CARDS
const StatusInfoCard = ({ status, booking }: { status: string; booking?: Booking }) => {
  const isPendingAndClose = useMemo(() => {
    if (status !== "pending" || !booking) return false;
    const remaining = getRemainingTime(booking.date, booking.time);
    return !remaining.isExpired && remaining.totalMinutes <= 60;
  }, [status, booking]);

  const messages: Record<string, string> = {
    pending: isPendingAndClose 
      ? "⚠️ Awaiting confirmation close to appointment time. Need a faster response? Contact the salon directly." 
      : "Your booking request has been received. Salon must confirm before appointment time. Need a faster response? Contact the salon directly.",
    confirmed: "Your appointment has been confirmed. We look forward to welcoming you.",
    completed: "Thank you for visiting Look's Hub. We'd love to hear your feedback.",
    cancelled_by_user: "You cancelled this appointment.",
    cancelled_by_salon: "The salon cancelled this appointment. Please contact them for details.",
    rejected: "The salon was unable to accommodate this booking request.",
    expired: "This booking expired because the salon did not confirm before the appointment time.",
    no_show: "The appointment time has passed and the booking was not marked as completed."
  };
  
  const styles: Record<string, string> = {
    pending: isPendingAndClose
      ? "bg-red-500/5 border-red-500/20 text-red-600 font-medium animate-pulse"
      : "bg-amber-500/5 border-amber-500/10 text-amber-700/80",
    confirmed: "bg-emerald-500/5 border-emerald-500/10 text-emerald-700/80",
    completed: "bg-[color:var(--gold-soft)]/10 border-[color:var(--gold)]/20 text-[color:var(--charcoal)]/80",
    cancelled_by_user: "bg-red-500/5 border-red-500/10 text-red-700/80",
    cancelled_by_salon: "bg-red-500/5 border-red-500/10 text-red-700/80",
    rejected: "bg-red-500/5 border-red-500/10 text-red-700/80",
    expired: "bg-orange-500/5 border-orange-500/10 text-orange-700/80",
    no_show: "bg-red-500/5 border-red-500/10 text-red-700/80"
  };
  
  return (
    <div className={`mt-4 p-3.5 rounded-2xl border text-xs leading-relaxed font-light ${styles[status] || "bg-secondary/10 border-border text-muted-foreground"}`}>
      {messages[status]}
    </div>
  );
};

// 6. LIVE APPOINTMENT COUNTDOWN
const AppointmentCountdown = ({ dateStr, timeStr, status }: { dateStr: string; timeStr: string; status?: string }) => {
  const [remaining, setRemaining] = useState<RemainingTime>(() => getRemainingTime(dateStr, timeStr));

  useEffect(() => {
    const tick = () => setRemaining(getRemainingTime(dateStr, timeStr));
    tick();
    const interval = setInterval(tick, 10000);
    return () => clearInterval(interval);
  }, [dateStr, timeStr]);

  if (remaining.isExpired || !remaining.label) return null;

  // Urgency states
  const totalHours = remaining.totalMinutes / 60;
  const isWarning = status === "pending" && totalHours < 6;
  const isCritical = status === "pending" && totalHours < 1;

  const urgencyClass = isCritical
    ? "bg-red-500/10 border-red-500/20"
    : isWarning
      ? "bg-amber-500/10 border-amber-500/20"
      : "bg-[color:var(--gold-soft)]/20 border-[color:var(--gold)]/20";

  const iconClass = isCritical
    ? "text-red-500"
    : isWarning
      ? "text-amber-500"
      : "text-[color:var(--gold)]";

  const valueClass = isCritical
    ? "text-red-500"
    : isWarning
      ? "text-amber-600"
      : "text-[color:var(--gold)]";

  const label = isCritical
    ? "Urgent: Awaiting salon confirmation"
    : isWarning
      ? "Confirmation deadline approaching"
      : status === "pending"
        ? "Must be confirmed in:"
        : "Appointment In:";

  return (
    <div className={`mt-4 p-3.5 ${urgencyClass} rounded-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs sm:text-sm`}>
      <span className="text-[color:var(--charcoal)]/60 font-light flex items-center gap-1.5 shrink-0">
        <Clock size={13} className={iconClass} /> {label}
      </span>
      <span className={`font-semibold ${valueClass} tracking-wide text-right`}>{remaining.label}</span>
    </div>
  );
};

// BOOKING AGE DISPLAY
const BookingAge = ({ createdAt }: { createdAt: string }) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  let label: string;
  if (diffDays === 0) label = "Requested today";
  else if (diffDays === 1) label = "Requested yesterday";
  else if (diffDays < 7) label = `Requested ${diffDays} days ago`;
  else {
    label = `Booked on ${created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  
  return (
    <span className="text-[10px] text-[color:var(--charcoal)]/40 font-light">
      {label}
    </span>
  );
};

// CONFIRMATION DEADLINE DISPLAY (for pending bookings)
const ConfirmationDeadline = ({ dateStr, timeStr }: { dateStr: string; timeStr: string }) => {
  const apptTime = new Date(`${dateStr}T${timeStr}:00+05:30`);
  if (isNaN(apptTime.getTime())) return null;
  
  const now = new Date();
  if (apptTime <= now) return null;
  
  const formatted = apptTime.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  
  // Format time in 12h
  const [hours, minutes] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const timeFormatted = `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  
  return (
    <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-xs text-amber-700/80 font-light flex items-start gap-2">
      <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-500" />
      <div>
        <span className="font-medium">Confirmation required before:</span>
        <span className="ml-1">{formatted} at {timeFormatted}</span>
      </div>
    </div>
  );
};

// 2. STATUS HISTORY TIMELINE
const Timeline = ({ history }: { history: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!history || history.length === 0) return null;
  
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <div className="mt-4 pt-4 border-t border-[color:var(--charcoal)]/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-[color:var(--charcoal)]/60 hover:text-[color:var(--charcoal)] transition-colors focus:outline-none cursor-pointer"
      >
        <span>{isOpen ? "Hide Timeline Details" : "Show Status Timeline"}</span>
        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 ml-3 pl-4 border-l-2 border-[color:var(--gold)]/20 space-y-4 py-1">
              {sortedHistory.map((event, idx) => {
                const dateObj = new Date(event.changedAt);
                const dateStr = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                const timeStr = dateObj.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
                
                return (
                  <div key={idx} className="relative pl-6">
                    <div className={`absolute left-[-21px] top-[4px] w-2.5 h-2.5 rounded-full border-2 bg-[color:var(--cream)] transition-all duration-300 ${
                      idx === 0 ? "border-[color:var(--gold)] bg-[color:var(--gold)]" : "border-[color:var(--charcoal)]/30"
                    }`} />
                    
                    <p className="text-[11px] sm:text-xs font-semibold text-[color:var(--charcoal)]">
                      {event.status} <span className="text-[9px] text-[color:var(--charcoal)]/40 font-light">by {event.changedBy}</span>
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-[color:var(--charcoal)]/50 mt-0.5 font-light">
                      {dateStr}, {timeStr}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const formatDateTime = (dateStr: string, timeStr: string) => {
  try {
    const dateObj = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString('en-US', options);
    
    let timeFormatted = timeStr;
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
      timeFormatted = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    return `${dateFormatted} at ${timeFormatted}`;
  } catch (e) {
    return `${dateStr} ${timeStr}`;
  }
};

function BookingsDashboard() {
  const navigate = useNavigate();
  const [lookupName, setLookupName] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedBookings, setSearchedBookings] = useState<Booking[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  // Tick counter for real-time re-evaluation (increments every 10s)
  const [tick, setTick] = useState(0);
  
  // Last checked state for footer trust indicators
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(null);

  const lastCheckedText = useMemo(() => {
    if (!lastCheckedTime) return "";
    const diffMs = Date.now() - lastCheckedTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Updated just now";
    if (diffMins === 1) return "Last checked 1 minute ago";
    return `Last checked ${diffMins} minutes ago`;
  }, [lastCheckedTime, tick]);

  // Modals state
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [calendarMenuOpen, setCalendarMenuOpen] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Real-time auto-expiry: re-evaluate booking states every 10 seconds
  useEffect(() => {
    if (searchedBookings.length === 0) return;
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, [searchedBookings.length]);

  // Memoized bookings with evaluated statuses (recomputed on tick or data change)
  const evaluatedBookings = useMemo(() => {
    return searchedBookings.map(b => ({
      ...b,
      status: evaluateClientStatus(b),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedBookings, tick]);

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);

    const nameVal = lookupName.trim();
    const phoneVal = lookupPhone.trim();

    if (!nameVal) {
      setLookupError("Customer name is required");
      return;
    }

    if (!phoneVal) {
      setLookupError("Phone number is required");
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`${apiUrl}/bookings/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: nameVal, phone: phoneVal })
      });

      const resData = await res.json();

      if (res.ok) {
        if (resData.success && resData.data) {
          setSearchedBookings(resData.data);
          setLastCheckedTime(new Date());
          setHasSearched(true);
          toast.success(`Found ${resData.data.length} appointments`);
        }
      } else {
        setSearchedBookings([]);
        if (res.status === 429) {
          setLookupError("Too many lookup attempts. Please try again after a minute.");
        } else if (res.status === 404) {
          setHasSearched(true);
        } else {
          setLookupError("Please verify your name and phone number.");
        }
      }
    } catch (err) {
      console.error(err);
      setLookupError("Please verify your name and phone number.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenReschedule = (booking: Booking) => {
    if (!isActionable(booking)) {
      toast.error("This booking can no longer be rescheduled.");
      return;
    }
    if ((booking.rescheduleCount || 0) >= 2) {
      toast.error("You have reached the maximum number of allowed reschedules. Please contact the salon directly.");
      return;
    }
    // Verify appointment is at least ALLOW_RESCHEDULE_UNTIL_HOURS hours away
    const appointmentTime = new Date(`${booking.date}T${booking.time}:00+05:30`);
    const now = new Date();
    const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < ALLOW_RESCHEDULE_UNTIL_HOURS) {
      toast.error(`Appointments can only be rescheduled at least ${ALLOW_RESCHEDULE_UNTIL_HOURS} hours before the scheduled time.`);
      return;
    }
    setNewDate(booking.date);
    setNewTime(booking.time);
    setRescheduleBooking(booking);
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleBooking || !newDate || !newTime) return;
    setIsRescheduling(true);
    try {
      const res = await fetch(`${apiUrl}/bookings/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rescheduleBooking._id,
          date: newDate,
          time: newTime,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reschedule booking");
      
      toast.success("Appointment rescheduled successfully.");
      setRescheduleBooking(null);
      if (data.data) {
        setSearchedBookings(prev => prev.map(b => b._id === data.data._id ? data.data : b));
        setLastCheckedTime(new Date());
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelBooking) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`${apiUrl}/bookings/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cancelBooking._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel booking");

      toast.success("Appointment cancelled successfully");
      setCancelBooking(null);
      if (data.data) {
        setSearchedBookings(prev => prev.map(b => b._id === data.data._id ? data.data : b));
        setLastCheckedTime(new Date());
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewBooking) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${apiUrl}/bookings/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reviewBooking._id,
          rating,
          feedback,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      toast.success("Thank you for your valuable feedback!");
      setReviewBooking(null);
      setRating(5);
      setFeedback("");
      if (data.data) {
        setSearchedBookings(prev => prev.map(b => b._id === data.data._id ? data.data : b));
        setLastCheckedTime(new Date());
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleBookAgain = (booking: Booking) => {
    navigate({
      to: "/book",
      search: {
        service: booking.serviceId || booking.service,
        artist: booking.barberId || booking.stylist,
        notes: booking.notes || ""
      }
    });
  };

  const triggerWhatsApp = (booking: Booking) => {
    const text = `Hello Look's Hub Salon, I need support regarding my booking ID: ${booking._id}. Details: ${booking.service} on ${booking.date} at ${booking.time}.`;
    const url = `https://wa.me/919516350601?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Calendar Link Generators
  const getGoogleCalendarUrl = (booking: Booking) => {
    const startStr = `${booking.date.replace(/-/g, "")}T${booking.time.replace(":", "")}00Z`;
    const durationMin = booking.duration ? parseInt(booking.duration) : 60;
    const endHour = parseInt(booking.time.split(":")[0]) + Math.floor(durationMin / 60);
    const endMin = parseInt(booking.time.split(":")[1]) + (durationMin % 60);
    const endFormattedTime = `${endHour.toString().padStart(2, '0')}${endMin.toString().padStart(2, '0')}00`;
    const endStr = `${booking.date.replace(/-/g, "")}T${endFormattedTime}Z`;
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Look%27s+Hub+Salon+-+${encodeURIComponent(booking.service)}&dates=${startStr}/${endStr}&details=Stylist:+${encodeURIComponent(booking.stylist || 'Any Stylist')}+%0ABooking+ID:+${booking._id}&location=Silicon+City,+Indore`;
  };

  const getOutlookCalendarUrl = (booking: Booking) => {
    const startStr = `${booking.date}T${booking.time}:00Z`;
    return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=Look%27s+Hub+Salon+-+${encodeURIComponent(booking.service)}&startdt=${startStr}&body=Stylist:+${encodeURIComponent(booking.stylist || 'Any Stylist')}+%0ABooking+ID:+${booking._id}&location=Silicon+City,+Indore`;
  };

  const downloadAppleCalendarIcs = (booking: Booking) => {
    const startStr = `${booking.date.replace(/-/g, "")}T${booking.time.replace(":", "")}00Z`;
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:Look's Hub Salon - ${booking.service}`,
      `DTSTART:${startStr}`,
      `DESCRIPTION:Stylist: ${booking.stylist || 'Any'}\\nBooking ID: ${booking._id}`,
      "LOCATION:Silicon City\\, Indore",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `looks-hub-booking-${booking._id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderBookingCard = (booking: Booking, idx: number) => {
    const canActOn = isActionable(booking);
    const isTerminal = !canActOn && booking.status !== "pending" && booking.status !== "confirmed";
    
    // Check reschedule notice window (2 hours)
    const appointmentTime = new Date(`${booking.date}T${booking.time}:00+05:30`);
    const now = new Date();
    const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isLessThanRescheduleLimit = diffHours < ALLOW_RESCHEDULE_UNTIL_HOURS;
    
    return (
      <motion.div
        key={booking._id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.55, delay: idx * 0.05 }}
        className="group bg-[color:var(--cream)] border border-[color:var(--charcoal)]/10 rounded-3xl p-6 md:p-8 flex flex-col hover:border-[color:var(--gold)]/30 hover:shadow-[var(--shadow-soft)] transition-all duration-500 relative"
      >
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          {/* Booking Card Details */}
          <div className="flex gap-5 items-start">
            <div className="w-20 h-20 rounded-2xl bg-[color:var(--charcoal)]/5 border border-[color:var(--charcoal)]/5 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=200"
                alt={booking.service}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div>
              {/* Booking Reference + Age */}
              <div className="text-[10px] text-[color:var(--charcoal)]/40 font-mono tracking-wider mb-1 flex items-center gap-1.5">
                <span className="uppercase font-medium">Ref:</span>
                <span className="font-bold text-[color:var(--charcoal)]/70">{booking.reference || booking._id.substring(0, 8).toUpperCase()}</span>
                <span className="mx-1 text-[color:var(--charcoal)]/20">·</span>
                <BookingAge createdAt={booking.createdAt} />
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="font-display text-xl md:text-2xl font-light text-[color:var(--charcoal)]">
                  {booking.service}
                </h3>
                <span className={`text-[9px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                  booking.status === "confirmed" ? "bg-emerald-500/10 text-emerald-600" :
                  booking.status === "pending" ? "bg-amber-500/10 text-amber-600" :
                  booking.status === "completed" ? "bg-blue-500/10 text-blue-600" :
                  booking.status === "expired" ? "bg-orange-500/10 text-orange-600" :
                  booking.status === "no_show" ? "bg-red-500/10 text-red-600" :
                  booking.status === "rejected" ? "bg-red-500/10 text-red-600" :
                  isCancelledStatus(booking.status) ? "bg-red-500/10 text-red-600" :
                  "bg-red-500/10 text-red-600"
                }`}>
                  <StatusIcon status={booking.status} size={10} />
                  {getFriendlyStatusLabel(booking.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-[color:var(--charcoal)]/65 font-light">
                <span className="flex items-center gap-2">
                  <Calendar size={13} className="text-[color:var(--gold)]" />
                  {formatDateTime(booking.date, booking.time)}
                </span>
                <span className="flex items-center gap-2">
                  <User size={13} className="text-[color:var(--gold)]" />
                  Stylist: {booking.stylist || "Any Stylist"}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={13} className="text-[color:var(--gold)]" />
                  Duration: {booking.duration || "60 Min"}
                </span>
                <span className="flex items-center gap-2">
                  <DollarSign size={13} className="text-[color:var(--gold)]" />
                  Price: ₹{(booking.price || 1200).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Card Actions */}
          <div className="flex flex-col items-end gap-2 shrink-0 border-t border-[color:var(--charcoal)]/5 pt-4 md:pt-0 md:border-0 w-full md:w-auto">
            {/* Reschedule count — only show if reschedules remain */}
            {canActOn && (booking.rescheduleCount || 0) < 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] uppercase tracking-widest text-[color:var(--gold)]/80 font-semibold mb-1 md:self-end self-start"
              >
                Reschedules Remaining: {Math.max(0, 2 - (booking.rescheduleCount || 0))} of 2
              </motion.div>
            )}
            
            {/* Urgent direct response helper above action buttons for pending */}
            {booking.status === "pending" && (
              <span className="text-[10px] text-[color:var(--charcoal)]/55 font-light mb-1 md:self-end self-start">
                Need a faster response? Contact salon directly:
              </span>
            )}

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
              {/* ACTIONABLE: Cancel + Reschedule + WhatsApp + Calendar */}
              {canActOn ? (
                <>
                  <button
                    onClick={() => handleOpenReschedule(booking)}
                    disabled={(booking.rescheduleCount || 0) >= 2 || isLessThanRescheduleLimit}
                    title={(booking.rescheduleCount || 0) >= 2 
                      ? "Reschedule limit reached" 
                      : isLessThanRescheduleLimit 
                        ? `Appointments can only be rescheduled at least ${ALLOW_RESCHEDULE_UNTIL_HOURS} hours before the scheduled time.`
                        : "Reschedule Appointment"
                    }
                    className="px-4 py-2 border border-[color:var(--charcoal)]/15 rounded-full text-xs font-medium hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition-all duration-300 disabled:opacity-40 disabled:hover:border-[color:var(--charcoal)]/15 disabled:hover:text-[color:var(--charcoal)]/65 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => setCancelBooking(booking)}
                    className="px-4 py-2 border border-red-500/20 text-red-500/80 rounded-full text-xs font-medium hover:bg-red-500/5 transition-all duration-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => triggerWhatsApp(booking)}
                    className="p-2 bg-emerald-500/10 text-emerald-600 rounded-full hover:bg-emerald-500/20 transition-all duration-300 cursor-pointer"
                    title="Contact Salon"
                  >
                    <MessageCircle size={16} />
                  </button>

                  {/* Calendar Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setCalendarMenuOpen(calendarMenuOpen === booking._id ? null : booking._id)}
                      className="p-2.5 bg-[color:var(--charcoal)]/5 text-[color:var(--charcoal)]/75 rounded-full hover:bg-[color:var(--charcoal)]/10 hover:text-[color:var(--charcoal)] transition-all duration-300 flex items-center justify-center cursor-pointer"
                      title="Add to Calendar"
                    >
                      <CalendarPlus size={16} />
                    </button>
                    
                    <AnimatePresence>
                      {calendarMenuOpen === booking._id && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setCalendarMenuOpen(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            className="absolute right-0 mt-2 bg-[color:var(--cream)] border border-[color:var(--charcoal)]/10 rounded-2xl py-2 w-48 shadow-luxe z-30 flex flex-col"
                          >
                            <a
                              href={getGoogleCalendarUrl(booking)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 text-xs hover:bg-[color:var(--charcoal)]/5 flex items-center justify-between text-[color:var(--charcoal)]/85"
                              onClick={() => setCalendarMenuOpen(null)}
                            >
                              Google Calendar
                            </a>
                            <button
                              onClick={() => {
                                downloadAppleCalendarIcs(booking);
                                setCalendarMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-[color:var(--charcoal)]/5 flex items-center justify-between text-[color:var(--charcoal)]/85"
                            >
                              Apple Calendar
                            </button>
                            <a
                              href={getOutlookCalendarUrl(booking)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 text-xs hover:bg-[color:var(--charcoal)]/5 flex items-center justify-between text-[color:var(--charcoal)]/85"
                              onClick={() => setCalendarMenuOpen(null)}
                            >
                              Outlook Calendar
                            </a>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                /* TERMINAL: Book Again + Review + Contact Salon */
                <>
                  {/* Leave Review — only for completed */}
                  {booking.status === "completed" && !booking.review && (
                    <button
                      onClick={() => setReviewBooking(booking)}
                      className="px-4 py-2 bg-[color:var(--gold)]/10 text-[color:var(--gold)] hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star size={13} fill="currentColor" /> Leave Review
                    </button>
                  )}

                  {/* Review badge */}
                  {booking.status === "completed" && booking.review && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/5 border border-amber-500/10 rounded-full text-[11px] text-amber-600 font-medium">
                      <Star size={12} fill="currentColor" /> {booking.review.rating} Reviewed
                    </div>
                  )}

                  {/* Book Again */}
                  <button
                    onClick={() => handleBookAgain(booking)}
                    className="px-4 py-2 bg-[color:var(--charcoal)] text-[color:var(--cream)] rounded-full text-xs font-medium hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] transition-all duration-300 cursor-pointer"
                  >
                    Book Again
                  </button>

                  {/* Contact Salon — for expired, no_show, cancelled_by_salon, rejected */}
                  {(booking.status === "expired" || booking.status === "no_show" || booking.status === "cancelled_by_salon" || booking.status === "rejected") && (
                    <button
                      onClick={() => triggerWhatsApp(booking)}
                      className="px-4 py-2 border border-emerald-500/20 text-emerald-600 rounded-full text-xs font-medium hover:bg-emerald-500/5 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle size={13} /> Contact Salon
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Visual Journey Tracker */}
        <VisualJourneyTracker status={booking.status} />

        {/* Live Countdown — for pending and confirmed upcoming bookings */}
        {(booking.status === "pending" || booking.status === "confirmed") && (
          <AppointmentCountdown dateStr={booking.date} timeStr={booking.time} status={booking.status} />
        )}

        {/* Confirmation Deadline — for pending bookings */}
        {booking.status === "pending" && (
          <ConfirmationDeadline dateStr={booking.date} timeStr={booking.time} />
        )}

        {/* Status Info Card */}
        <StatusInfoCard status={booking.status} booking={booking} />

        {/* Status History Timeline */}
        {booking.statusHistory && booking.statusHistory.length > 0 && (
          <Timeline history={booking.statusHistory} />
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[color:var(--cream)] text-[color:var(--charcoal)] pb-24 md:pb-0">
      <Navbar />
      <Toaster position="top-right" richColors />

      <main className="pt-32 pb-24">
        {/* Decorative Gradients */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 80% 20%, rgba(197, 160, 89, 0.15) 0%, transparent 60%)",
          }} />
        </div>

        <div className="container-luxe relative z-10 max-w-2xl mx-auto px-4">
          {isSearching ? (
            // Loading State
            <div className="text-center py-20 space-y-4">
              <Loader2 size={36} className="animate-spin text-[color:var(--gold)] mx-auto" />
              <p className="text-sm font-light text-[color:var(--charcoal)]/60">
                Finding your appointments...
              </p>
            </div>
          ) : !hasSearched ? (
            // Empty / Initial Lookup State
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold flex items-center justify-center gap-3 mb-4">
                  <span className="w-8 h-[1px] bg-[color:var(--gold)] inline-block" />
                  PORTAL
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-light tracking-tight text-[color:var(--charcoal)]">
                  Booking Lookup
                </h1>
                <p className="text-sm text-[color:var(--charcoal)]/60 mt-3 font-light max-w-md mx-auto leading-relaxed">
                  To view details, reschedule, or cancel your appointment, please enter your details below.
                </p>
              </div>

              {/* Secure Booking Lookup Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[color:var(--cream)] border border-[color:var(--charcoal)]/10 rounded-[2rem] p-8 md:p-10 shadow-[var(--shadow-soft)] max-w-md mx-auto"
              >
                <form onSubmit={handleLookupSubmit} className="space-y-5">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[color:var(--charcoal)]/50 block font-semibold mb-2">
                      Customer Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Sachin Singh"
                        value={lookupName}
                        onChange={(e) => setLookupName(e.target.value)}
                        className="w-full bg-[color:var(--cream)] border border-[color:var(--charcoal)]/15 rounded-full px-5 py-3 text-xs focus:outline-none focus:border-[color:var(--gold)] focus:ring-1 focus:ring-[color:var(--gold)] transition-all font-light"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[color:var(--charcoal)]/50 block font-semibold mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="e.g. 9516350602"
                        value={lookupPhone}
                        onChange={(e) => setLookupPhone(e.target.value.replace(/[^\d+]/g, ""))}
                        className="w-full bg-[color:var(--cream)] border border-[color:var(--charcoal)]/15 rounded-full px-5 py-3 text-xs focus:outline-none focus:border-[color:var(--gold)] focus:ring-1 focus:ring-[color:var(--gold)] transition-all font-light"
                      />
                    </div>
                  </div>

                  {lookupError && (
                    <div className="text-red-500 text-[11px] font-medium flex items-center gap-1.5 px-2">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{lookupError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[color:var(--charcoal)] text-[color:var(--cream)] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    Find My Bookings
                  </button>
                </form>
              </motion.div>
            </div>
          ) : (
            // Booking Details State
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold flex items-center justify-center gap-3 mb-4">
                  <span className="w-8 h-[1px] bg-[color:var(--gold)] inline-block" />
                  APPOINTMENT DETAILS
                </p>
                <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-[color:var(--charcoal)]">
                  {searchedBookings.length === 0 ? "No Appointments Found" : `Found ${searchedBookings.length} Appointment${searchedBookings.length === 1 ? "" : "s"}`}
                </h1>
                {lastCheckedText && (
                  <p className="text-[10px] text-[color:var(--charcoal)]/40 mt-2 font-mono flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    {lastCheckedText}
                  </p>
                )}
              </div>

              {searchedBookings.length === 0 ? (
                // Empty State
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-secondary/10 border border-[color:var(--charcoal)]/10 rounded-3xl p-12 text-center max-w-xl mx-auto my-12"
                >
                  <div className="w-16 h-16 rounded-full bg-[color:var(--charcoal)]/5 flex items-center justify-center mx-auto mb-6 text-[color:var(--gold)]">
                    <Calendar size={28} />
                  </div>
                  <h3 className="font-display text-2xl mb-3 text-[color:var(--charcoal)]">
                    No Appointments Found
                  </h3>
                  <p className="text-sm text-[color:var(--charcoal)]/60 font-light max-w-md mx-auto mb-8 leading-relaxed">
                    No appointments found for this name and phone number.
                  </p>
                  <button
                    onClick={() => {
                      setHasSearched(false);
                      setLookupError(null);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[color:var(--charcoal)] text-[color:var(--cream)] rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] transition-all duration-300 shadow-soft"
                  >
                    Search Another Booking
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {evaluatedBookings.map((booking, idx) => renderBookingCard(booking, idx))}

                  <div className="pt-6 text-center">
                    <button
                      onClick={() => {
                        setHasSearched(false);
                        setLookupError(null);
                      }}
                      className="px-8 py-3.5 bg-[color:var(--charcoal)] text-[color:var(--cream)] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] transition-all duration-300 cursor-pointer"
                    >
                      Search Another Booking
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRescheduleBooking(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative bg-[color:var(--cream)] border border-[color:var(--charcoal)]/15 rounded-[2rem] p-8 max-w-md w-full shadow-luxe"
            >
              <h3 className="font-display text-2xl mb-1 text-[color:var(--charcoal)]">
                Reschedule Appointment
              </h3>
              <p className="text-xs text-[color:var(--charcoal)]/50 mb-6">
                Choose a new date and time for your salon experience.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[color:var(--charcoal)]/50 block font-semibold mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[color:var(--charcoal)]/5 border border-[color:var(--charcoal)]/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[color:var(--gold)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[color:var(--charcoal)]/50 block font-semibold mb-2">
                    Select Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(() => {
                      const getTodayString = () => {
                        const d = new Date();
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      };
                      const filteredTimes = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"].filter((t) => {
                        if (newDate !== getTodayString()) return true;
                        const apptTime = new Date(`${newDate}T${t}`);
                        const now = new Date();
                        const diffHours = (apptTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                        return diffHours >= 2;
                      });

                      if (filteredTimes.length === 0) {
                        return (
                          <div className="col-span-3 p-4 text-center border border-dashed border-[color:var(--charcoal)]/15 rounded-2xl bg-[color:var(--charcoal)]/5">
                            <p className="text-xs font-semibold text-[color:var(--charcoal)]/70">No bookable slots remain today.</p>
                            <p className="text-[10px] text-[color:var(--charcoal)]/50 mt-0.5">Please select another date.</p>
                          </div>
                        );
                      }

                      return filteredTimes.map((t) => {
                        const isActive = newTime === t;
                        return (
                          <button
                            key={t}
                            onClick={() => setNewTime(t)}
                            className={`py-2 rounded-xl text-xs border transition-all ${isActive ? "bg-[color:var(--charcoal)] text-[color:var(--cream)] border-transparent" : "border-[color:var(--charcoal)]/10 hover:border-[color:var(--gold)]"}`}
                          >
                            {t}
                          </button>
                        );
                      });
                    })()}
                  </div>
                  
                  {/* Info Badge */}
                  <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/20 text-[color:var(--gold)] text-[10px]">
                    <Clock size={12} className="shrink-0" />
                    <span>Appointments require at least 2 hours advance notice.</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setRescheduleBooking(null)}
                  className="flex-1 py-3 border border-[color:var(--charcoal)]/15 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[color:var(--charcoal)] hover:text-[color:var(--cream)] transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleSubmit}
                  disabled={isRescheduling}
                  className="flex-1 py-3 bg-[color:var(--charcoal)] text-[color:var(--cream)] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] disabled:opacity-40 transition-all duration-300"
                >
                  {isRescheduling ? "Saving..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancellation Confirmation Dialog */}
      <AnimatePresence>
        {cancelBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancelBooking(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative bg-[color:var(--cream)] border border-[color:var(--charcoal)]/15 rounded-[2rem] p-8 max-w-sm w-full shadow-luxe text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-5">
                <AlertCircle size={22} />
              </div>
              <h3 className="font-display text-2xl mb-2 text-[color:var(--charcoal)]">
                Cancel Appointment?
              </h3>
              <p className="text-xs text-[color:var(--charcoal)]/60 font-light leading-relaxed mb-6">
                Are you sure you want to cancel this booking for <b>{cancelBooking.service}</b>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setCancelBooking(null)}
                  className="flex-1 py-3 border border-[color:var(--charcoal)]/15 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[color:var(--charcoal)] hover:text-[color:var(--cream)] transition-all duration-300"
                >
                  No, Keep
                </button>
                <button
                  onClick={handleCancelSubmit}
                  disabled={isCancelling}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-red-600 disabled:opacity-40 transition-all duration-300"
                >
                  {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leave Review Modal */}
      <AnimatePresence>
        {reviewBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewBooking(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative bg-[color:var(--cream)] border border-[color:var(--charcoal)]/15 rounded-[2rem] p-8 max-w-md w-full shadow-luxe"
            >
              <h3 className="font-display text-2xl mb-1 text-[color:var(--charcoal)]">
                Leave a Review
              </h3>
              <p className="text-xs text-[color:var(--charcoal)]/50 mb-6">
                Share your experience on your grooming session for <b>{reviewBooking.service}</b>.
              </p>

              {/* Rating selection */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isSelected = star <= (hoverRating ?? rating);
                  return (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 transition-transform hover:scale-110 duration-200"
                    >
                      <Star
                        size={32}
                        fill={isSelected ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={1.5}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Feedback text */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[color:var(--charcoal)]/50 block font-semibold mb-2">
                  Written Feedback
                </label>
                <textarea
                  rows={4}
                  placeholder="Share your thoughts about the service, stylist, or atmosphere..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-[color:var(--charcoal)]/5 border border-[color:var(--charcoal)]/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-[color:var(--gold)] resize-none font-light"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setReviewBooking(null)}
                  className="flex-1 py-3 border border-[color:var(--charcoal)]/15 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[color:var(--charcoal)] hover:text-[color:var(--cream)] transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={isSubmittingReview}
                  className="flex-1 py-3 bg-[color:var(--charcoal)] text-[color:var(--cream)] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] disabled:opacity-40 transition-all duration-300"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
