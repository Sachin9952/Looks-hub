import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CalendarDays, Clock, User, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { services, artists } from "@/lib/data";
import { z } from "zod";
import { getServiceImage } from "@/components/site/Services";
import { getImageUrl, getOptimizedCloudinaryUrl } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

const bookSearchSchema = z.object({
  service: z.string().optional(),
  artist: z.string().optional(),
  notes: z.string().optional(),
});

export const Route = createFileRoute("/book")({
  validateSearch: (search) => bookSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Book Appointment · Look's Hub" },
      { name: "description", content: "Reserve your appointment at Look's Hub Unisex Salon & Academy in Indore." },
    ],
  }),
  component: BookPage,
});

const steps = ["Service", "Stylist", "Date & Time", "Details"];
const times = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"];

function BookPage() {
  const { service, artist, notes } = Route.useSearch();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [dbArtists, setDbArtists] = useState<any[]>([]);
  const [data, setData] = useState({
    serviceId: "",
    artistId: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    notes: notes || "",
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/services`);
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.data && resData.data.length > 0) {
            const mapped = resData.data.filter((s: any) => s.isActive).map((s: any) => {
              const staticMatch = services.find(
                (sd) => sd.name.toLowerCase() === s.name.toLowerCase()
              );
              return {
                id: staticMatch?.id || s._id,
                _id: s._id,
                name: s.name,
                category: s.category,
                desc: s.description || staticMatch?.desc || s.name,
                price: s.price,
                duration: s.duration,
                image: getServiceImage(s.name)
              };
            });
            setDbServices(mapped);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load services for booking:", err);
      }
      setDbServices(services);
    };
    fetchServices();
  }, [service]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/artists`);
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.data && resData.data.length > 0) {
            const mapped = resData.data.map((a: any) => ({
              id: a._id,
              name: a.name,
              specialty: a.specialty,
              image: a.imageUrl || a.image,
            }));
            setDbArtists(mapped);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load artists for booking:", err);
      }
      setDbArtists(artists);
    };
    fetchArtists();
  }, []);

  // Prefill serviceId and artistId from query params once lists are loaded
  useEffect(() => {
    if (service && dbServices.length > 0) {
      const match = dbServices.find(
        (s: any) => s.id === service || s._id === service || s.name.toLowerCase() === service.toLowerCase()
      );
      if (match) {
        setData(d => ({ ...d, serviceId: match.id }));
      }
    }
  }, [service, dbServices]);

  useEffect(() => {
    if (artist && dbArtists.length > 0) {
      const match = dbArtists.find(
        (a: any) => a.id === artist || a.name.toLowerCase() === artist.toLowerCase()
      );
      if (match) {
        setData(d => ({ ...d, artistId: match.id }));
      }
    }
  }, [artist, dbArtists]);

  // Auto-advance step if query parameters pre-populate selections
  useEffect(() => {
    if (service && artist) {
      setStep(2); // Go straight to Date & Time
    } else if (service) {
      setStep(1); // Go straight to Stylist
    }
  }, [service, artist]);

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!data.date || !data.artistId || !data.serviceId) {
      setAvailableSlots([]);
      return;
    }

    const fetchAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const queryParams = new URLSearchParams({
          artistId: data.artistId,
          date: data.date,
          serviceId: data.serviceId,
        });
        const res = await fetch(`${apiUrl}/bookings/available-slots?${queryParams.toString()}`);
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && Array.isArray(resData.data)) {
            setAvailableSlots(resData.data);
            // If the previously selected time is not in the new available slots, clear it
            if (data.time && !resData.data.includes(data.time)) {
              setData(d => ({ ...d, time: "" }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load available slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [data.date, data.artistId, data.serviceId]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const canNext =
    (step === 0 && data.serviceId) ||
    (step === 1 && data.artistId) ||
    (step === 2 && data.date && data.time) ||
    (step === 3 && data.name && data.phone);

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      const selectedService = dbServices.find((s) => s.id === data.serviceId)?.name || data.serviceId;
      const selectedStylist = dbArtists.find((a) => a.id === data.artistId)?.name || data.artistId;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: data.name,
          phone: data.phone,
          service: selectedService,
          stylist: selectedStylist,
          date: data.date,
          time: data.time,
          notes: data.notes,
          serviceId: data.serviceId,
          barberId: data.artistId,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Failed to submit booking");
      }

      if (resData.success && resData.data && resData.data._id) {
        localStorage.setItem("looks_hub_phone", data.phone);
        const existing = JSON.parse(localStorage.getItem("looks_hub_bookings") || "[]");
        if (!existing.includes(resData.data._id)) {
          existing.push(resData.data._id);
          localStorage.setItem("looks_hub_bookings", JSON.stringify(existing));
        }
      }

      setDone(true);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong while booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return <Confirmation data={data} services={dbServices} artists={dbArtists} />;

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container-luxe max-w-4xl">
          <Link to="/" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">← Back to home</Link>
          <h1 className="mt-6 font-display text-4xl md:text-6xl">Reserve your visit.</h1>
          <p className="mt-3 text-muted-foreground max-w-md">A few quiet questions, and your appointment is held.</p>

          {/* Stepper */}
          <div className="mt-12 grid grid-cols-4 gap-2 md:gap-4">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-col gap-2">
                <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-[color:var(--gold)]" : "bg-border"}`} />
                <p className={`text-[11px] uppercase tracking-[0.18em] ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                  0{i + 1} · {s}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-card border border-border rounded-[1.75rem] p-6 md:p-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              {submitError ? (
                <motion.div
                  key="submit-error"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="text-center py-10 px-4 max-w-md mx-auto"
                >
                  <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 grid place-items-center mx-auto mb-6">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="font-display text-2xl mb-3 text-foreground">
                    Limit Reached
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {submitError.includes("3 active") ? (
                      <>
                        You already have 3 active appointments.
                        <br />
                        Please complete or cancel one of your existing appointments before booking another.
                      </>
                    ) : (
                      submitError
                    )}
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        setSubmitError(null);
                        setStep(2); // Go back to Date & Time selection
                      }}
                      className="btn-ghost-luxe text-xs uppercase tracking-wider py-3 px-6 border border-border hover:border-foreground rounded-full"
                    >
                      Adjust Date/Time
                    </button>
                    <Link
                      to="/account/bookings"
                      className="btn-gold text-xs uppercase tracking-wider py-3 px-6 inline-flex justify-center items-center rounded-full"
                    >
                      Manage Bookings
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  {step === 0 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {dbServices.map((s) => {
                        const active = data.serviceId === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setData({ ...data, serviceId: s.id })}
                            className={`text-left flex items-center gap-4 p-3 rounded-2xl border transition-all ${active ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)]/30" : "border-border hover:border-foreground/30"}`}
                          >
                            <img src={s.image} alt="" className="w-20 h-20 object-cover rounded-xl" />
                            <div className="flex-1">
                              <p className="font-display text-xl">{s.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{s.duration} · From ₹{s.price.toLocaleString("en-IN")}</p>
                            </div>
                            {active && <Check size={18} className="text-[color:var(--gold)]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                      {dbArtists.map((a) => {
                        const active = data.artistId === a.id;
                        return (
                          <button
                            key={a.id}
                            onClick={() => setData({ ...data, artistId: a.id })}
                            className={`text-left rounded-2xl overflow-hidden border transition-all ${active ? "border-[color:var(--gold)] shadow-[var(--shadow-soft)] bg-[color:var(--gold-soft)]/10" : "border-border hover:border-foreground/30"}`}
                          >
                            <div className="aspect-square overflow-hidden bg-secondary">
                              <ImageWithFallback 
                                src={getOptimizedCloudinaryUrl(a.image, 300, 300)} 
                                alt={a.name} 
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                              />
                            </div>
                            <div className="p-3 sm:p-4">
                              <p className="font-display text-sm sm:text-base md:text-lg leading-snug">{a.name}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{a.specialty}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid gap-8 md:grid-cols-2">
                      <div>
                        <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
                          <CalendarDays size={14} /> Select date
                        </label>
                        <input
                          type="date"
                          value={data.date}
                          min={getTodayString()}
                          onChange={(e) => setData({ ...data, date: e.target.value })}
                          className="mt-3 w-full bg-secondary/60 border border-border rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[color:var(--gold)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
                          <Clock size={14} /> Select time
                        </label>
                        
                        {loadingSlots ? (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6].map((idx) => (
                              <div key={idx} className="h-10 rounded-xl bg-secondary/80 animate-pulse border border-border/50" />
                            ))}
                          </div>
                        ) : !data.date ? (
                          <div className="mt-3 p-6 text-center border border-dashed border-border rounded-2xl text-xs text-muted-foreground bg-secondary/10">
                            Please select a date to view available slots.
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <div className="mt-3 p-6 text-center border border-dashed border-border rounded-2xl bg-secondary/15">
                            {data.date === getTodayString() ? (
                              <>
                                <p className="text-sm font-display text-muted-foreground">No bookable slots remain today.</p>
                                <p className="text-xs text-muted-foreground mt-1">Please select another date.</p>
                              </>
                            ) : (
                              <p className="text-sm font-display text-muted-foreground">Fully Booked for this day</p>
                            )}
                            <button
                              type="button"
                              onClick={() => setData(d => ({ ...d, date: "" }))}
                              className="mt-3 text-xs font-semibold text-[color:var(--gold)] hover:underline"
                            >
                              Choose Another Date
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="mt-3 grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                              {availableSlots.map((t) => {
                                const active = data.time === t;
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setData({ ...data, time: t })}
                                    className={`py-2.5 rounded-xl text-sm border transition-all ${active ? "bg-[color:var(--charcoal)] text-[color:var(--cream)] border-transparent" : "border-border hover:border-foreground/30 bg-secondary/20"}`}
                                  >
                                    {t}
                                  </button>
                                );
                              })}
                            </div>
                            
                            {/* Info Badge */}
                            <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-[color:var(--gold-soft)]/10 border border-[color:var(--gold)]/20 text-[color:var(--gold)] text-xs">
                              <Clock size={12} className="shrink-0" />
                              <span>Appointments require at least 2 hours advance notice.</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid gap-5 max-w-xl">
                      <Field label="Full name" icon={<User size={14} />}>
                        <input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="e.g. Priya Kapoor" className="input-luxe" />
                      </Field>
                      <Field label="Phone">
                        <input 
                          type="tel" 
                          value={data.phone} 
                          onChange={(e) => setData({ ...data, phone: e.target.value.replace(/(?!^\+)[^\d]/g, "") })} 
                          placeholder="+91 ..." 
                          className="input-luxe" 
                        />
                      </Field>
                      <Field label="Notes (optional)">
                        <textarea value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} rows={4} placeholder="Anything we should know — allergies, references, occasion..." className="input-luxe resize-none" />
                      </Field>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          {!submitError && (
            <div className="mt-8 flex items-center justify-between">
              <button onClick={prev} disabled={step === 0 || loading} className="btn-ghost-luxe disabled:opacity-40 disabled:pointer-events-none">
                <ArrowLeft size={16} /> Back
              </button>
              {step < steps.length - 1 ? (
                <button onClick={next} disabled={!canNext} className="btn-gold disabled:opacity-40 disabled:pointer-events-none">
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={!canNext || loading} className="btn-gold disabled:opacity-40 disabled:pointer-events-none">
                  {loading ? "Submitting..." : "Confirm Booking"} <Check size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`.input-luxe{width:100%;background:color-mix(in oklab,var(--secondary) 60%,transparent);border:1px solid var(--border);border-radius:0.75rem;padding:0.85rem 1rem;font-size:0.875rem;outline:none}.input-luxe:focus{border-color:var(--gold)}`}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
        {icon}{label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Confirmation({ data, services, artists }: { data: { serviceId: string; artistId: string; date: string; time: string; name: string }; services: any[]; artists: any[] }) {
  const service = services.find((s) => s.id === data.serviceId);
  const artist = artists.find((a) => a.id === data.artistId);
  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="pt-40 pb-24">
        <div className="container-luxe max-w-2xl text-center">
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 180, damping: 14 }} className="mx-auto w-20 h-20 rounded-full bg-[color:var(--gold)] grid place-items-center text-[color:var(--charcoal)]">
            <Check size={36} strokeWidth={2.5} />
          </motion.div>
          <h1 className="mt-8 font-display text-4xl md:text-6xl">You're booked, {data.name.split(" ")[0]}.</h1>
          <p className="mt-4 text-muted-foreground">A quiet confirmation will arrive on WhatsApp shortly.</p>

          <div className="mt-12 bg-card border border-border rounded-3xl p-8 text-left">
            <Detail label="Service" value={service?.name ?? "—"} />
            <Detail label="Stylist" value={artist?.name ?? "—"} />
            <Detail label="When" value={`${data.date}  ·  ${data.time}`} />
          </div>
          <Link to="/" className="mt-10 btn-gold inline-flex">Return Home</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="font-display text-lg">{value}</span>
    </div>
  );
}
