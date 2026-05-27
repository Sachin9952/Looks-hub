import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  Trash2,
  LogOut,
  AlertCircle,
  FileText,
  RefreshCw,
  LayoutDashboard,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Tag,
  Plus,
  ToggleLeft,
  ToggleRight,
  Eye,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardPage,
});

interface Booking {
  _id: string;
  customerName: string;
  phone: string;
  email?: string;
  service: string;
  stylist?: string;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  description?: string;
  isPopular: boolean;
  isActive: boolean;
}

interface GalleryItem {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  type: "hair" | "makeup" | "skin" | "nails" | "grooming";
  isFeatured: boolean;
}

interface Testimonial {
  _id: string;
  customerName: string;
  rating: number;
  review: string;
  source: string;
  isFeatured: boolean;
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalServices: number;
  totalTestimonials: number;
}

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "services" | "gallery" | "testimonials" | "offers">("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters and Forms state
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [adminUser, setAdminUser] = useState<any>(null);

  // New Items Form states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [newService, setNewService] = useState({
    name: "", category: "", price: 0, duration: "", description: "", isPopular: false, isActive: true
  });

  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [newGallery, setNewGallery] = useState({
    title: "", category: "", imageUrl: "", type: "hair" as any, isFeatured: false
  });

  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    customerName: "", rating: 5, review: "", source: "Google Maps", isFeatured: false
  });

  const navigate = useNavigate();

  const getHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate({ to: "/admin/login" });
      return;
    }

    try {
      const storedUser = localStorage.getItem("adminUser");
      if (storedUser) {
        setAdminUser(JSON.parse(storedUser));
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      // 1. Fetch Stats
      const statsRes = await fetch(`${apiUrl}/dashboard/stats`, { headers: getHeaders() });
      if (statsRes.status === 401) {
        handleLogout();
        return;
      }
      const statsJson = await statsRes.json();
      if (statsRes.ok) setStats(statsJson.data);

      // 2. Fetch Bookings
      const bookingsRes = await fetch(`${apiUrl}/bookings`, { headers: getHeaders() });
      if (bookingsRes.ok) {
        const bookingsJson = await bookingsRes.json();
        setBookings(bookingsJson.data);
      }

      // 3. Fetch Services
      const servicesRes = await fetch(`${apiUrl}/services`, { headers: getHeaders() });
      if (servicesRes.ok) {
        const servicesJson = await servicesRes.json();
        setServicesList(servicesJson.data);
      }

      // 4. Fetch Gallery
      const galleryRes = await fetch(`${apiUrl}/gallery`, { headers: getHeaders() });
      if (galleryRes.ok) {
        const galleryJson = await galleryRes.json();
        setGalleryList(galleryJson.data);
      }

      // 5. Fetch Testimonials
      const testimonialsRes = await fetch(`${apiUrl}/testimonials`, { headers: getHeaders() });
      if (testimonialsRes.ok) {
        const testimonialsJson = await testimonialsRes.json();
        setTestimonialsList(testimonialsJson.data);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate({ to: "/admin/login" });
  };

  // Booking Actions
  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/bookings/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchDashboardData();
      else alert("Failed to update status");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm("Delete this booking record?")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/bookings/${id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) fetchDashboardData();
      else alert("Failed to delete booking");
    } catch (err) {
      console.error(err);
    }
  };

  // Service Actions
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/services`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(newService),
      });
      if (res.ok) {
        setShowServiceForm(false);
        setNewService({ name: "", category: "", price: 0, duration: "", description: "", isPopular: false, isActive: true });
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create service");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleServiceActive = async (service: Service) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/services/${service._id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/services/${id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Gallery Actions
  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/gallery`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(newGallery),
      });
      if (res.ok) {
        setShowGalleryForm(false);
        setNewGallery({ title: "", category: "", imageUrl: "", type: "hair", isFeatured: false });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/gallery/${id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Testimonial Actions
  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/testimonials`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(newTestimonial),
      });
      if (res.ok) {
        setShowTestimonialForm(false);
        setNewTestimonial({ customerName: "", rating: 5, review: "", source: "Google Maps", isFeatured: false });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/testimonials/${id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    return b.status === bookingFilter;
  });

  return (
    <div className="min-h-screen bg-[color:var(--charcoal)] text-[color:var(--cream)] flex">
      {/* Sidebar Layout */}
      <aside className="w-64 bg-black/40 border-r border-white/10 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-white/10">
            <span className="font-display text-xl tracking-wider text-white">Look's Hub <span className="text-[color:var(--gold)]">Admin</span></span>
            {adminUser && <p className="text-xs text-white/40 mt-1">Logged in as {adminUser.name}</p>}
          </div>

          <nav className="p-4 space-y-1">
            <SidebarLink active={activeTab === "overview"} label="Overview" icon={<LayoutDashboard size={16} />} onClick={() => setActiveTab("overview")} />
            <SidebarLink active={activeTab === "bookings"} label="Appointments" icon={<Calendar size={16} />} onClick={() => setActiveTab("bookings")} />
            <SidebarLink active={activeTab === "services"} label="Services" icon={<Layers size={16} />} onClick={() => setActiveTab("services")} />
            <SidebarLink active={activeTab === "gallery"} label="Gallery" icon={<ImageIcon size={16} />} onClick={() => setActiveTab("gallery")} />
            <SidebarLink active={activeTab === "testimonials"} label="Testimonials" icon={<MessageSquare size={16} />} onClick={() => setActiveTab("testimonials")} />
            <SidebarLink active={activeTab === "offers"} label="Offers & Packages" icon={<Tag size={16} />} onClick={() => setActiveTab("offers")} />
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar Layout */}
        <header className="h-20 bg-black/20 border-b border-white/10 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Selector */}
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="md:hidden bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-[color:var(--gold)] focus:outline-none"
            >
              <option value="overview">Overview</option>
              <option value="bookings">Appointments</option>
              <option value="services">Services</option>
              <option value="gallery">Gallery</option>
              <option value="testimonials">Testimonials</option>
              <option value="offers">Offers</option>
            </select>

            <h2 className="text-lg font-display text-white capitalize hidden md:inline">{activeTab} Manager</h2>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={fetchDashboardData} className="p-2 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 text-white transition-all">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <Link to="/" className="text-xs uppercase tracking-widest text-white/60 hover:text-[color:var(--gold)] transition-colors">View Site</Link>
            <button onClick={handleLogout} className="md:hidden text-xs uppercase tracking-widest text-red-400">Logout</button>
          </div>
        </header>

        {/* Tab Contents */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-white/60">
              <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[color:var(--gold)] rounded-full mb-4"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <OverviewCard title="Total Visits" value={stats.totalBookings} icon={<FileText size={18} />} />
                      <OverviewCard title="Pending" value={stats.pendingBookings} icon={<AlertCircle size={18} />} color="text-yellow-500" />
                      <OverviewCard title="Confirmed" value={stats.confirmedBookings} icon={<CheckCircle size={18} />} color="text-blue-500" />
                      <OverviewCard title="Completed" value={stats.completedBookings} icon={<CheckCircle size={18} />} color="text-green-500" />
                      <OverviewCard title="Cancelled" value={stats.cancelledBookings} icon={<XCircle size={18} />} color="text-red-500" />
                    </div>
                  )}

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Bookings */}
                    <div className="lg:col-span-2 bg-black/20 border border-white/10 rounded-3xl p-6">
                      <h3 className="font-display text-xl mb-4 text-white">Recent Appointments</h3>
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map((b) => (
                          <div key={b._id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">{b.customerName}</p>
                              <p className="text-xs text-white/50 mt-1">{b.service} · {b.date} at {b.time}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              b.status === "confirmed" ? "bg-blue-500/25 text-blue-400 border border-blue-500/40" :
                              b.status === "completed" ? "bg-green-500/25 text-green-400 border border-green-500/40" :
                              b.status === "cancelled" ? "bg-red-500/25 text-red-400 border border-red-500/40" :
                              "bg-yellow-500/25 text-yellow-400 border border-yellow-500/40"
                            }`}>
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats overview */}
                    <div className="bg-black/20 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display text-xl mb-4 text-white">Salon Inventory</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-white/60">Services Configured</span>
                            <span className="font-medium text-white">{servicesList.length}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-white/60">Gallery Portfolio</span>
                            <span className="font-medium text-white">{galleryList.length}</span>
                          </div>
                          <div className="flex justify-between pb-2">
                            <span className="text-white/60">Verified Reviews</span>
                            <span className="font-medium text-white">{testimonialsList.length}</span>
                          </div>
                        </div>
                      </div>

                      <button onClick={() => setActiveTab("bookings")} className="btn-gold w-full mt-6 justify-center text-xs tracking-widest uppercase">
                        Manage Appointments
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  {/* Status filter bar */}
                  <div className="flex flex-wrap gap-2">
                    {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setBookingFilter(status)}
                        className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold border transition-all ${
                          bookingFilter === status
                            ? "bg-[color:var(--gold)] text-black border-transparent"
                            : "bg-white/5 border-white/10 hover:border-white/30 text-white/60"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {filteredBookings.length === 0 ? (
                    <div className="bg-black/20 border border-white/10 rounded-3xl p-12 text-center text-white/50">
                      No appointments matching "{bookingFilter}".
                    </div>
                  ) : (
                    <div className="bg-black/20 border border-white/10 rounded-3xl overflow-hidden shadow-[var(--shadow-soft)]">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-wider text-white/40">
                              <th className="p-5 font-semibold">Guest</th>
                              <th className="p-5 font-semibold">Service</th>
                              <th className="p-5 font-semibold">Stylist</th>
                              <th className="p-5 font-semibold">Date & Time</th>
                              <th className="p-5 font-semibold">Status</th>
                              <th className="p-5 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {filteredBookings.map((b) => (
                              <tr key={b._id} className="hover:bg-white/5 transition-colors">
                                <td className="p-5">
                                  <div>
                                    <p className="font-semibold text-white flex items-center gap-1.5">
                                      <User size={13} className="text-white/40" /> {b.customerName}
                                    </p>
                                    <p className="text-xs text-white/50 mt-1 flex items-center gap-1.5">
                                      <Phone size={11} /> {b.phone}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-5 font-medium text-white">{b.service}</td>
                                <td className="p-5 text-white/60">{b.stylist || "Any"}</td>
                                <td className="p-5">
                                  <div className="flex flex-col gap-1 text-xs">
                                    <span className="flex items-center gap-1 text-white">
                                      <Calendar size={12} className="text-white/40" /> {b.date}
                                    </span>
                                    <span className="flex items-center gap-1 text-white/50">
                                      <Clock size={12} /> {b.time}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                    b.status === "confirmed" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                    b.status === "completed" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                                    b.status === "cancelled" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                    "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="p-5 text-right">
                                  <div className="flex justify-end gap-2">
                                    {b.status === "pending" && (
                                      <button
                                        onClick={() => handleUpdateBookingStatus(b._id, "confirmed")}
                                        title="Confirm Appointment"
                                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 transition-all"
                                      >
                                        <CheckCircle size={14} />
                                      </button>
                                    )}
                                    {b.status !== "completed" && b.status !== "cancelled" && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateBookingStatus(b._id, "completed")}
                                          title="Mark Completed"
                                          className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/25 text-green-400 transition-all"
                                        >
                                          <CheckCircle size={14} />
                                        </button>
                                        <button
                                          onClick={() => handleUpdateBookingStatus(b._id, "cancelled")}
                                          title="Cancel"
                                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-all"
                                        >
                                          <XCircle size={14} />
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => handleDeleteBooking(b._id)}
                                      title="Delete"
                                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/25 text-white/60 hover:text-red-400 transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Services Tab */}
              {activeTab === "services" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display text-2xl text-white">Active Catalog</h3>
                    <button onClick={() => setShowServiceForm(!showServiceForm)} className="btn-gold flex items-center gap-1.5 text-xs py-2 px-4">
                      <Plus size={14} /> {showServiceForm ? "Cancel" : "Add Service"}
                    </button>
                  </div>

                  {showServiceForm && (
                    <form onSubmit={handleCreateService} className="bg-black/20 border border-white/10 rounded-3xl p-6 max-w-2xl space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white/50">Service Name</label>
                          <input required value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} placeholder="e.g. Hair Botox" className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white/50">Category</label>
                          <input required value={newService.category} onChange={(e) => setNewService({...newService, category: e.target.value})} placeholder="e.g. Hair" className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white/50">Price (₹)</label>
                          <input required type="number" value={newService.price} onChange={(e) => setNewService({...newService, price: parseInt(e.target.value) || 0})} className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white/50">Duration</label>
                          <input required value={newService.duration} onChange={(e) => setNewService({...newService, duration: e.target.value})} placeholder="e.g. 90 min" className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-white/50">Description</label>
                        <textarea value={newService.description} onChange={(e) => setNewService({...newService, description: e.target.value})} placeholder="Describe the service..." className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none h-20" />
                      </div>
                      <div className="flex gap-6 pt-2">
                        <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/80 cursor-pointer">
                          <input type="checkbox" checked={newService.isPopular} onChange={(e) => setNewService({...newService, isPopular: e.target.checked})} className="rounded bg-white/5 border border-white/20 text-[color:var(--gold)] focus:ring-0" />
                          Mark Popular
                        </label>
                      </div>
                      <button type="submit" className="btn-gold text-xs py-2.5 px-6">Save Service</button>
                    </form>
                  )}

                  {servicesList.length === 0 ? (
                    <div className="bg-black/20 border border-white/10 rounded-3xl p-12 text-center text-white/50">
                      No services configured. Use the button to create one.
                    </div>
                  ) : (
                    <div className="bg-black/20 border border-white/10 rounded-3xl overflow-hidden shadow-[var(--shadow-soft)]">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-wider text-white/40">
                              <th className="p-5 font-semibold">Service</th>
                              <th className="p-5 font-semibold">Category</th>
                              <th className="p-5 font-semibold">Price</th>
                              <th className="p-5 font-semibold">Duration</th>
                              <th className="p-5 font-semibold">Popular</th>
                              <th className="p-5 font-semibold">Status</th>
                              <th className="p-5 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {servicesList.map((s) => (
                              <tr key={s._id} className="hover:bg-white/5 transition-colors">
                                <td className="p-5">
                                  <div>
                                    <p className="font-semibold text-white">{s.name}</p>
                                    {s.description && <p className="text-xs text-white/50 mt-1 max-w-sm truncate">{s.description}</p>}
                                  </div>
                                </td>
                                <td className="p-5 text-white/60">{s.category}</td>
                                <td className="p-5 font-medium text-white">₹{s.price}</td>
                                <td className="p-5 text-white/50">{s.duration}</td>
                                <td className="p-5">
                                  {s.isPopular ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[color:var(--gold)]/20 text-[color:var(--gold)] border border-[color:var(--gold)]/30">POPULAR</span>
                                  ) : "—"}
                                </td>
                                <td className="p-5">
                                  <button onClick={() => handleToggleServiceActive(s)} className="text-white/60 hover:text-white transition-colors">
                                    {s.isActive ? (
                                      <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                                        <ToggleRight size={18} /> ACTIVE
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-white/30 text-xs font-semibold">
                                        <ToggleLeft size={18} /> INACTIVE
                                      </span>
                                    )}
                                  </button>
                                </td>
                                <td className="p-5 text-right">
                                  <button
                                    onClick={() => handleDeleteService(s._id)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/25 text-white/60 hover:text-red-400 transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Gallery Tab */}
              {activeTab === "gallery" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display text-2xl text-white">Salon Gallery</h3>
                    <button onClick={() => setShowGalleryForm(!showGalleryForm)} className="btn-gold flex items-center gap-1.5 text-xs py-2 px-4">
                      <Plus size={14} /> {showGalleryForm ? "Cancel" : "Add Image"}
                    </button>
                  </div>

                  {showGalleryForm && (
                    <form onSubmit={handleCreateGalleryItem} className="bg-black/20 border border-white/10 rounded-3xl p-6 max-w-2xl space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white/50">Title</label>
                          <input required value={newGallery.title} onChange={(e) => setNewGallery({...newGallery, title: e.target.value})} placeholder="e.g. Balayage finish" className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white/50">Category</label>
                          <input required value={newGallery.category} onChange={(e) => setNewGallery({...newGallery, category: e.target.value})} placeholder="e.g. Hair color" className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white/50">Image URL</label>
                          <input required value={newGallery.imageUrl} onChange={(e) => setNewGallery({...newGallery, imageUrl: e.target.value})} placeholder="Paste image url..." className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white/50">Service Type</label>
                          <select value={newGallery.type} onChange={(e) => setNewGallery({...newGallery, type: e.target.value as any})} className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
                            <option value="hair">Hair</option>
                            <option value="makeup">Makeup</option>
                            <option value="skin">Skin</option>
                            <option value="nails">Nails</option>
                            <option value="grooming">Grooming</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-2">
                        <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/80 cursor-pointer">
                          <input type="checkbox" checked={newGallery.isFeatured} onChange={(e) => setNewGallery({...newGallery, isFeatured: e.target.checked})} className="rounded bg-white/5 border border-white/20 text-[color:var(--gold)] focus:ring-0" />
                          Feature in Highlights
                        </label>
                      </div>
                      <button type="submit" className="btn-gold text-xs py-2.5 px-6">Add to Gallery</button>
                    </form>
                  )}

                  {galleryList.length === 0 ? (
                    <div className="bg-black/20 border border-white/10 rounded-3xl p-12 text-center text-white/50">
                      No gallery images uploaded yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {galleryList.map((g) => (
                        <div key={g._id} className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                          <img src={g.imageUrl} alt={g.title} className="aspect-square w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                            <div>
                              <p className="font-semibold text-white">{g.title}</p>
                              <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{g.type} · {g.category}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              {g.isFeatured && <span className="text-[10px] text-[color:var(--gold)] uppercase tracking-wider font-semibold">Featured</span>}
                              <button onClick={() => handleDeleteGalleryItem(g._id)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/35 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Testimonials Tab */}
              {activeTab === "testimonials" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display text-2xl text-white">Guest Reviews</h3>
                    <button onClick={() => setShowTestimonialForm(!showTestimonialForm)} className="btn-gold flex items-center gap-1.5 text-xs py-2 px-4">
                      <Plus size={14} /> {showTestimonialForm ? "Cancel" : "Add Review"}
                    </button>
                  </div>

                  {showTestimonialForm && (
                    <form onSubmit={handleCreateTestimonial} className="bg-black/20 border border-white/10 rounded-3xl p-6 max-w-2xl space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white/50">Guest Name</label>
                          <input required value={newTestimonial.customerName} onChange={(e) => setNewTestimonial({...newTestimonial, customerName: e.target.value})} placeholder="e.g. Riya Sen" className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white/50">Rating (1-5)</label>
                          <input required type="number" min="1" max="5" value={newTestimonial.rating} onChange={(e) => setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value) || 5})} className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-white/50">Review Comment</label>
                        <textarea required value={newTestimonial.review} onChange={(e) => setNewTestimonial({...newTestimonial, review: e.target.value})} placeholder="Paste review text here..." className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none h-20" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white/50">Source</label>
                          <input value={newTestimonial.source} onChange={(e) => setNewTestimonial({...newTestimonial, source: e.target.value})} placeholder="e.g. Google Maps" className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                        </div>
                        <div className="flex items-end pb-3">
                          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/80 cursor-pointer">
                            <input type="checkbox" checked={newTestimonial.isFeatured} onChange={(e) => setNewTestimonial({...newTestimonial, isFeatured: e.target.checked})} className="rounded bg-white/5 border border-white/20 text-[color:var(--gold)] focus:ring-0" />
                            Feature on Landing Page
                          </label>
                        </div>
                      </div>
                      <button type="submit" className="btn-gold text-xs py-2.5 px-6">Publish Review</button>
                    </form>
                  )}

                  {testimonialsList.length === 0 ? (
                    <div className="bg-black/20 border border-white/10 rounded-3xl p-12 text-center text-white/50">
                      No testimonials published.
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {testimonialsList.map((t) => (
                        <div key={t._id} className="bg-black/20 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-white">{t.customerName}</p>
                                <p className="text-[11px] text-white/40 mt-0.5">{t.source}</p>
                              </div>
                              <div className="flex gap-0.5">
                                {Array.from({ length: t.rating }).map((_, i) => (
                                  <Star key={i} size={11} className="fill-[color:var(--gold)] text-[color:var(--gold)]" />
                                ))}
                              </div>
                            </div>
                            <p className="mt-4 text-sm text-white/70 leading-relaxed">"{t.review}"</p>
                          </div>
                          <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">{t.isFeatured ? "Featured" : "Standard"}</span>
                            <button onClick={() => handleDeleteTestimonial(t._id)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/35 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Offers Tab */}
              {activeTab === "offers" && (
                <div className="space-y-6">
                  <h3 className="font-display text-2xl text-white">Active Promo Packages</h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <PackageDisplayCard name="Quick Refresh" price="₹800" desc="Professional haircut, style & clean-up." />
                    <PackageDisplayCard name="Complete Makeover" price="₹2,200" desc="Haircut, nourishing hair spa treatment & advising session." />
                    <PackageDisplayCard name="Premium Bridal" price="₹4,500" desc="Full makeup, hair styling, skin prep, and trial run." />
                  </div>

                  <div className="bg-black/20 border border-white/10 rounded-3xl p-6 text-center text-white/50 max-w-xl">
                    <p className="text-sm">Note: Offer and Package listings are managed from the frontend data store. Update details in the client codebase directly.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl text-left transition-all ${
        active
          ? "bg-[color:var(--gold)]/10 text-[color:var(--gold)] border border-[color:var(--gold)]/20"
          : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function OverviewCard({ title, value, icon, color = "text-[color:var(--gold)]" }: { title: string; value: number; icon: React.ReactNode; color?: string }) {
  return (
    <div className="bg-black/20 border border-white/10 rounded-2xl p-5 shadow-[var(--shadow-soft)] flex items-start justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{title}</p>
        <p className="mt-2 font-display text-2xl md:text-3xl font-semibold text-white">{value}</p>
      </div>
      <div className={`p-2 bg-white/5 rounded-xl border border-white/5 ${color}`}>{icon}</div>
    </div>
  );
}

function PackageDisplayCard({ name, price, desc }: { name: string; price: string; desc: string }) {
  return (
    <div className="bg-black/20 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <p className="font-semibold text-white">{name}</p>
          <span className="text-sm font-semibold text-[color:var(--gold)]">{price}</span>
        </div>
        <p className="text-xs text-white/60 mt-3 leading-relaxed">{desc}</p>
      </div>
      <div className="mt-6 text-[10px] text-white/30 uppercase tracking-widest font-semibold">Active Campaign</div>
    </div>
  );
}
