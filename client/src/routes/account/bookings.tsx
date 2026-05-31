import { useState, useEffect } from "react";
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
  Star,
  MessageCircle,
  CalendarPlus,
  RotateCcw,
  Search,
  BookOpen,
  Loader2,
  ChevronRight,
  ArrowRight
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
  customerName: string;
  phone: string;
  email?: string;
  service: string;
  serviceId?: string;
  barberId?: string;
  stylist?: string;
  price?: number;
  duration?: string;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  rescheduleCount?: number;
  review?: {
    rating: number;
    feedback: string;
  };
}

const formatDateTime = (dateStr: string, timeStr: string) => {
  try {
    const dateObj = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString('en-US', options);
    
    // Format time
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
  const [phoneQuery, setPhoneQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  
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

  const fetchBookings = async (phoneToUse?: string) => {
    setLoading(true);
    try {
      const searchPhone = phoneToUse || phoneQuery || localStorage.getItem("looks_hub_phone") || "";
      if (!searchPhone) {
        // Check if there are local storage booking IDs
        const localBookingIds = JSON.parse(localStorage.getItem("looks_hub_bookings") || "[]");
        if (localBookingIds.length > 0) {
          // Fetch specific bookings
          const fetchedBookings: Booking[] = [];
          for (const id of localBookingIds) {
            try {
              const res = await fetch(`${apiUrl}/bookings/${id}`);
              if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                  fetchedBookings.push(data.data);
                }
              }
            } catch (err) {
              console.error(`Failed to fetch booking ${id}:`, err);
            }
          }
          setBookings(fetchedBookings.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()));
        } else {
          setBookings([]);
        }
        setLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/bookings?phone=${encodeURIComponent(searchPhone)}`);
      if (!res.ok) throw new Error("Failed to load bookings");
      const resData = await res.json();
      if (resData.success && resData.data) {
        setBookings(resData.data);
        if (phoneToUse || phoneQuery) {
          localStorage.setItem("looks_hub_phone", searchPhone);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong fetching bookings.");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneQuery.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setIsSearching(true);
    fetchBookings(phoneQuery);
  };

  const handleOpenReschedule = (booking: Booking) => {
    if (booking.status === "completed") {
      toast.error("Completed appointments cannot be rescheduled.");
      return;
    }
    if (booking.status === "cancelled") {
      toast.error("Cancelled appointments cannot be rescheduled.");
      return;
    }
    if ((booking.rescheduleCount || 0) >= 2) {
      toast.error("You have reached the maximum number of allowed reschedules. Please contact the salon directly.");
      return;
    }
    // Verify appointment is at least 4 hours away
    const appointmentTime = new Date(`${booking.date}T${booking.time}`);
    const now = new Date();
    const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 4) {
      toast.error("Appointments can only be rescheduled at least 4 hours before the scheduled time.");
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
      fetchBookings();
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
      fetchBookings();
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
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleBookAgain = (booking: Booking) => {
    navigate({ to: "/book", search: { service: booking.serviceId || booking.service } });
  };

  const triggerWhatsApp = (booking: Booking) => {
    const text = `Hello Look's Hub Salon, I need support regarding my booking ID: ${booking._id}. Details: ${booking.service} on ${booking.date} at ${booking.time}.`;
    const url = `https://wa.me/919926707048?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Calendar Link Generators
  const getGoogleCalendarUrl = (booking: Booking) => {
    const startStr = `${booking.date.replace(/-/g, "")}T${booking.time.replace(":", "")}00Z`;
    // Add 1 hour duration as fallback
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

  // Filter bookings
  const upcomingBookings = bookings.filter(b => b.status === "pending" || b.status === "confirmed");
  const historyBookings = bookings.filter(b => b.status === "completed" || b.status === "cancelled");

  const totalBookings = bookings.length;
  const upcomingCount = upcomingBookings.length;
  const completedCount = bookings.filter(b => b.status === "completed").length;

  const currentList = activeTab === "upcoming" ? upcomingBookings : historyBookings;

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

        <div className="container-luxe relative z-10 max-w-5xl">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold flex items-center gap-3 mb-4">
                <span className="w-8 h-[1px] bg-[color:var(--gold)] inline-block" />
                DASHBOARD
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-light tracking-tight text-[color:var(--charcoal)]">
                My Appointments
              </h1>
              <p className="text-sm text-[color:var(--charcoal)]/60 mt-2 font-light">
                Manage, reschedule, or review your premium salon experiences.
              </p>
            </div>

            {/* Quick search form */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--charcoal)]/40" />
                <input
                  type="text"
                  placeholder="Lookup phone number..."
                  value={phoneQuery}
                  onChange={(e) => setPhoneQuery(e.target.value)}
                  className="w-full bg-[color:var(--cream)] border border-[color:var(--charcoal)]/15 rounded-full pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[color:var(--gold)] focus:ring-1 focus:ring-[color:var(--gold)] transition-all font-light"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 bg-[color:var(--charcoal)] text-[color:var(--cream)] rounded-full text-xs font-medium hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] transition-all duration-300 flex items-center gap-1.5"
              >
                {isSearching ? <Loader2 size={12} className="animate-spin" /> : "Search"}
              </button>
            </form>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Total Bookings", val: totalBookings, icon: <BookOpen className="text-[color:var(--gold)]" size={20} /> },
              { label: "Upcoming Visits", val: upcomingCount, icon: <Calendar className="text-[color:var(--gold)]" size={20} /> },
              { label: "Completed Journeys", val: completedCount, icon: <CheckCircle className="text-[color:var(--gold)]" size={20} /> }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[color:var(--cream)] border border-[color:var(--charcoal)]/10 rounded-2xl p-6 flex items-center justify-between shadow-[var(--shadow-soft)] hover:border-[color:var(--gold)]/30 transition-all duration-300"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[color:var(--charcoal)]/50 block font-semibold mb-1">
                    {stat.label}
                  </span>
                  <span className="text-3xl font-display font-light text-[color:var(--charcoal)]">
                    {loading ? "..." : stat.val}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-[color:var(--charcoal)]/5 flex items-center justify-center">
                  {stat.icon}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-[color:var(--charcoal)]/10 mb-8 relative">
            {(["upcoming", "history"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] relative transition-colors ${isActive ? "text-[color:var(--charcoal)]" : "text-[color:var(--charcoal)]/40 hover:text-[color:var(--charcoal)]/70"}`}
                >
                  {tab === "upcoming" ? `Upcoming Appointments (${loading ? "0" : upcomingCount})` : `History (${loading ? "0" : historyBookings.length})`}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--gold)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Booking Cards / List */}
          <div className="space-y-6">
            {loading ? (
              // Skeleton loading states
              Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="bg-[color:var(--cream)] border border-[color:var(--charcoal)]/10 rounded-3xl p-6 md:p-8 animate-pulse flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-24 h-24 bg-[color:var(--charcoal)]/5 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3 w-full">
                    <div className="h-6 bg-[color:var(--charcoal)]/5 rounded w-1/3" />
                    <div className="h-4 bg-[color:var(--charcoal)]/5 rounded w-1/4" />
                    <div className="h-4 bg-[color:var(--charcoal)]/5 rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-[color:var(--charcoal)]/5 rounded-full w-28 shrink-0" />
                </div>
              ))
            ) : currentList.length === 0 ? (
              // Elegant Empty State
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary/10 border border-[color:var(--charcoal)]/10 rounded-3xl p-12 text-center max-w-xl mx-auto my-12"
              >
                <div className="w-16 h-16 rounded-full bg-[color:var(--charcoal)]/5 flex items-center justify-center mx-auto mb-6 text-[color:var(--gold)]">
                  {activeTab === "upcoming" ? <Calendar size={28} /> : <RotateCcw size={28} />}
                </div>
                <h3 className="font-display text-2xl mb-3 text-[color:var(--charcoal)]">
                  {activeTab === "upcoming" ? "No Upcoming Visits" : "No Booking History"}
                </h3>
                <p className="text-sm text-[color:var(--charcoal)]/60 font-light max-w-md mx-auto mb-8 leading-relaxed">
                  {activeTab === "upcoming"
                    ? "Your luxury grooming rituals await. Book your appointment now with one of our elite salon artisans."
                    : "You haven't completed any grooming rituals yet. Experience Looks Hub's fine hospitality today."}
                </p>
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[color:var(--charcoal)] text-[color:var(--cream)] rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] transition-all duration-300 shadow-soft"
                >
                  Schedule Appointment <ArrowRight size={14} />
                </Link>
              </motion.div>
            ) : (
              // Cards list
              <div className="space-y-6">
                {currentList.map((booking, idx) => {
                  const isUpcoming = activeTab === "upcoming";
                  return (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.55, delay: idx * 0.05 }}
                      className="group bg-[color:var(--cream)] border border-[color:var(--charcoal)]/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:border-[color:var(--gold)]/30 hover:shadow-[var(--shadow-soft)] transition-all duration-500 relative overflow-hidden"
                    >
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
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="font-display text-xl md:text-2xl font-light text-[color:var(--charcoal)]">
                              {booking.service}
                            </h3>
                            <span className={`text-[9px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${
                              booking.status === "confirmed" ? "bg-emerald-500/10 text-emerald-600" :
                              booking.status === "pending" ? "bg-amber-500/10 text-amber-600" :
                              booking.status === "completed" ? "bg-blue-500/10 text-blue-600" :
                              "bg-red-500/10 text-red-600"
                            }`}>
                              {booking.status}
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
                              Duration: {booking.duration || "45 Min"}
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
                        {isUpcoming && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-[10px] uppercase tracking-widest text-[color:var(--gold)]/80 font-medium mb-0.5 md:self-end self-start"
                          >
                            {booking.rescheduleCount === 0 ? "2 Reschedules Left" :
                             booking.rescheduleCount === 1 ? "1 Reschedule Left" :
                             "Reschedule Limit Reached"}
                          </motion.div>
                        )}
                        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
                          {isUpcoming ? (
                            <>
                              <button
                                onClick={() => handleOpenReschedule(booking)}
                                disabled={(booking.rescheduleCount || 0) >= 2}
                                title={(booking.rescheduleCount || 0) >= 2 ? "Maximum reschedule limit reached. Please contact the salon directly." : undefined}
                                className="px-4 py-2 border border-[color:var(--charcoal)]/15 rounded-full text-xs font-medium hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition-all duration-300 disabled:opacity-40 disabled:hover:border-[color:var(--charcoal)]/15 disabled:hover:text-[color:var(--charcoal)]/65 disabled:cursor-not-allowed"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => setCancelBooking(booking)}
                                className="px-4 py-2 border border-red-500/20 text-red-500/80 rounded-full text-xs font-medium hover:bg-red-500/5 transition-all duration-300"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => triggerWhatsApp(booking)}
                                className="p-2 bg-emerald-500/10 text-emerald-600 rounded-full hover:bg-emerald-500/20 transition-all duration-300"
                                title="WhatsApp Support"
                              >
                              <MessageCircle size={16} />
                            </button>

                            {/* Calendar Menu */}
                            <div className="relative">
                              <button
                                onClick={() => setCalendarMenuOpen(calendarMenuOpen === booking._id ? null : booking._id)}
                                className="p-2 bg-[color:var(--charcoal)]/5 text-[color:var(--charcoal)]/75 rounded-full hover:bg-[color:var(--charcoal)]/10 transition-all duration-300"
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
                                        className="px-4 py-2 text-xs hover:bg-[color:var(--charcoal)]/5 flex items-center justify-between"
                                        onClick={() => setCalendarMenuOpen(null)}
                                      >
                                        Google Calendar
                                      </a>
                                      <button
                                        onClick={() => {
                                          downloadAppleCalendarIcs(booking);
                                          setCalendarMenuOpen(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs hover:bg-[color:var(--charcoal)]/5 flex items-center justify-between"
                                      >
                                        Apple Calendar
                                      </button>
                                      <a
                                        href={getOutlookCalendarUrl(booking)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 text-xs hover:bg-[color:var(--charcoal)]/5 flex items-center justify-between"
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
                          <>
                            {booking.status === "completed" && !booking.review && (
                              <button
                                onClick={() => setReviewBooking(booking)}
                                className="px-4 py-2 bg-[color:var(--gold)]/10 text-[color:var(--gold)] hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5"
                              >
                                <Star size={13} fill="currentColor" /> Leave Review
                              </button>
                            )}

                            {booking.status === "completed" && booking.review && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/5 border border-amber-500/10 rounded-full text-[11px] text-amber-600 font-medium">
                                <Star size={12} fill="currentColor" /> {booking.review.rating} Reviewed
                              </div>
                            )}

                            <button
                              onClick={() => handleBookAgain(booking)}
                              className="px-4 py-2 bg-[color:var(--charcoal)] text-[color:var(--cream)] rounded-full text-xs font-medium hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] transition-all duration-300"
                            >
                              Book Again
                            </button>

                            {booking.status === "cancelled" && (
                              <button
                                onClick={() => handleOpenReschedule(booking)}
                                disabled={(booking.rescheduleCount || 0) >= 2}
                                title={(booking.rescheduleCount || 0) >= 2 ? "Maximum reschedule limit reached. Please contact the salon directly." : undefined}
                                className="px-4 py-2 border border-[color:var(--charcoal)]/15 rounded-full text-xs font-medium hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition-all duration-300 disabled:opacity-40 disabled:hover:border-[color:var(--charcoal)]/15 disabled:hover:text-[color:var(--charcoal)]/65 disabled:cursor-not-allowed"
                              >
                                Reschedule
                              </button>
                            )}
                          </>
                        )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
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
                    {["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"].map((t) => {
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
                    })}
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
