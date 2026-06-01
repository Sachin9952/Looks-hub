import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials as defaultTestimonials } from "@/lib/data";

export function Testimonials() {
  const [testimonialsList, setTestimonialsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/testimonials`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            const mapped = data.data.filter((t: any) => t.isFeatured).map((t: any) => ({
              name: t.customerName,
              role: t.source || "Guest Review",
              quote: t.review,
              rating: t.rating
            }));
            setTestimonialsList(mapped);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch testimonials from API:", err);
      }

      // Fallback
      setTestimonialsList(defaultTestimonials);
    };
    fetchTestimonials();
  }, []);

  return (
    <section className="py-28 md:py-36">
      <div className="container-luxe">
        <div className="max-w-2xl">
          <p className="eyebrow">Kind Words</p>
          <h2 className="mt-5 font-display text-4xl md:text-6xl">Stories from our guests.</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonialsList.map((t, i) => (
            <motion.figure
              key={`${t.name}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="bg-card border border-border rounded-3xl p-8 md:p-9 flex flex-col"
            >
              <div className="flex gap-0.5 text-[color:var(--gold)]">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-current" />
                ))}
              </div>
              <blockquote className="mt-6 font-display text-xl leading-snug">“{t.quote}”</blockquote>
              <figcaption className="mt-8 pt-6 border-t border-border flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-secondary grid place-items-center font-display text-lg text-[color:var(--gold)]">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
