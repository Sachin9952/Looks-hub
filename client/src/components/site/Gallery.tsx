import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { services } from "@/lib/data";
import { getImageUrl } from "@/lib/utils";

const categories = ["Hair", "Makeup", "Skin", "Nails", "Grooming"];

// Reuse service images for transformation cards (dummy before/after)
const defaultItems = [
  { cat: "Hair", before: services[0].image, after: services[2].image, title: "Bronze balayage", imageUrl: "" },
  { cat: "Makeup", before: services[3].image, after: services[3].image, title: "Bridal soft glam", imageUrl: "" },
  { cat: "Skin", before: services[4].image, after: services[4].image, title: "Glow facial", imageUrl: "" },
  { cat: "Nails", before: services[5].image, after: services[5].image, title: "Sculpted nude", imageUrl: "" },
  { cat: "Grooming", before: services[6].image, after: services[6].image, title: "Beard architecture", imageUrl: "" },
  { cat: "Hair", before: services[1].image, after: services[0].image, title: "Glossy blowout", imageUrl: "" },
];

export function Gallery() {
  const [active, setActive] = useState<string>("Hair");
  const [galleryItems, setGalleryItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/gallery`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            const mapped = data.data.map((item: any) => ({
              cat: item.category || item.type.charAt(0).toUpperCase() + item.type.slice(1),
              title: item.title,
              imageUrl: getImageUrl(item.imageUrl),
              before: "",
              after: ""
            }));
            setGalleryItems(mapped);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch gallery from API:", err);
      }
      
      // Fallback
      setGalleryItems(defaultItems);
    };
    fetchGallery();
  }, []);

  const filtered = galleryItems.filter((i) => i.cat.toLowerCase() === active.toLowerCase());

  return (
    <section id="gallery" className="py-28 md:py-36 bg-secondary/40">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="eyebrow">Transformations</p>
            <h2 className="mt-5 font-display text-4xl md:text-6xl max-w-2xl">Before & after, in our own words.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.18em] transition-all ${
                  active === c
                    ? "bg-[color:var(--charcoal)] text-[color:var(--cream)]"
                    : "border border-border hover:border-foreground/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it, i) => (
            <motion.div
              key={`${it.title}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="bg-card rounded-3xl overflow-hidden border border-border"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                {it.before && it.after ? (
                  <div className="grid grid-cols-2 h-full">
                    <div className="relative h-full">
                      <img src={it.before} alt="Before" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] bg-background/80 backdrop-blur px-2.5 py-1 rounded-full">Before</span>
                    </div>
                    <div className="relative h-full border-l border-border">
                      <img src={it.after} alt="After" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] bg-[color:var(--gold)] text-[color:var(--charcoal)] px-2.5 py-1 rounded-full">After</span>
                    </div>
                  </div>
                ) : (
                  <img src={it.imageUrl} alt={it.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                )}
              </div>
              <div className="p-5">
                <p className="font-display text-xl">{it.title}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">{it.cat}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
