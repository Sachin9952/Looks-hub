import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CalendarDays, Clock, User } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { services, artists } from "@/lib/data";
import { z } from "zod";

const bookSearchSchema = z.object({
  service: z.string().optional(),
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
  const { service } = Route.useSearch();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    serviceId: service || "",
    artistId: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    notes: "",
  });

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const canNext =
    (step === 0 && data.serviceId) ||
    (step === 1 && data.artistId) ||
    (step === 2 && data.date && data.time) ||
    (step === 3 && data.name && data.phone);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedService = services.find((s) => s.id === data.serviceId)?.name || data.serviceId;
      const selectedStylist = artists.find((a) => a.id === data.artistId)?.name || data.artistId;

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
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Failed to submit booking");
      }

      setDone(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong while booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return <Confirmation data={data} />;

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
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                {step === 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {services.map((s) => {
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
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {artists.map((a) => {
                      const active = data.artistId === a.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => setData({ ...data, artistId: a.id })}
                          className={`text-left rounded-2xl overflow-hidden border transition-all ${active ? "border-[color:var(--gold)] shadow-[var(--shadow-soft)]" : "border-border hover:border-foreground/30"}`}
                        >
                          <div className="aspect-[4/5] overflow-hidden">
                            <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                            <p className="font-display text-lg">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.specialty}</p>
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
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setData({ ...data, date: e.target.value })}
                        className="mt-3 w-full bg-secondary/60 border border-border rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[color:var(--gold)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
                        <Clock size={14} /> Select time
                      </label>
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {times.map((t) => {
                          const active = data.time === t;
                          return (
                            <button
                              key={t}
                              onClick={() => setData({ ...data, time: t })}
                              className={`py-2.5 rounded-xl text-sm border transition-all ${active ? "bg-[color:var(--charcoal)] text-[color:var(--cream)] border-transparent" : "border-border hover:border-foreground/30"}`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid gap-5 max-w-xl">
                    <Field label="Full name" icon={<User size={14} />}>
                      <input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="e.g. Priya Kapoor" className="input-luxe" />
                    </Field>
                    <Field label="Phone">
                      <input value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} placeholder="+91 ..." className="input-luxe" />
                    </Field>
                    <Field label="Notes (optional)">
                      <textarea value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} rows={4} placeholder="Anything we should know — allergies, references, occasion..." className="input-luxe resize-none" />
                    </Field>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
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

function Confirmation({ data }: { data: { serviceId: string; artistId: string; date: string; time: string; name: string } }) {
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
