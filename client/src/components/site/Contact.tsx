import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { salonAddress, salonPhone, salonWhatsApp } from "@/lib/data";

export function Contact() {
  const handleWhatsAppClick = () => {
    // Analytics hook placeholder
    if (typeof window !== "undefined") {
      console.log("WhatsApp contact button clicked");
    }
  };

  return (
    <section id="contact" className="py-20 md:py-24 scroll-mt-20">
      <div className="container-luxe grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left column - Information & Contact Details */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <p className="eyebrow">Visit Us</p>
            <h2 className="mt-4 font-display text-4xl md:text-6xl">Step into Look's Hub.</h2>
            <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed">
              We're located in Indore's Silicon City area. Visit us for expert care, warm hospitality, and premium salon services. Everyone is welcome here.
            </p>

            <ul className="mt-8 space-y-6">
              <Row
                icon={<MapPin size={18} />}
                label="Address"
                value={
                  <div className="leading-relaxed text-sm md:text-base">
                    Silicon City Main Rd, Near Paliwal Dairy
                    <br />
                    Indore, Madhya Pradesh 452012
                  </div>
                }
              />
              <Row
                icon={<Phone size={18} />}
                label="Phone"
                value={
                  <div className="text-lg md:text-xl font-semibold tracking-wide text-[color:var(--gold)]">
                    {salonPhone}
                  </div>
                }
                link={`tel:${salonPhone.replace(/\s+/g, '')}`}
              />
              <Row
                icon={<Clock size={18} />}
                label="Hours"
                value={<div className="text-sm md:text-base">Daily · 10:00 AM to 9:00 PM</div>}
              />
            </ul>
          </div>
        </div>

        {/* Right column - Trust, Map, Get Directions, WhatsApp */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Trust Badge */}
          <div className="flex items-center gap-2 bg-secondary/45 border border-border/60 rounded-2xl px-5 py-3 w-fit self-start backdrop-blur-sm shadow-sm hover:scale-[1.02] transition-transform duration-300">
            <div className="flex gap-1 text-[color:var(--gold)] text-sm">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <span className="text-[11px] md:text-xs uppercase tracking-[0.18em] font-medium text-foreground">
              Trusted by 500+ Clients in Indore
            </span>
          </div>

          {/* Map Container */}
          <div className="relative rounded-3xl overflow-hidden border border-border/80 h-[300px] md:h-[350px] bg-secondary shadow-luxe transition-all duration-300 hover:border-[color:var(--gold)]/40 group">
            <iframe
              title="Look's Hub Salon location"
              src="https://maps.google.com/maps?q=Look's%20Hub%20Unisex%20Salon%20%26%20Academy%20Silicon%20City%20Indore&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="absolute inset-0 w-full h-full grayscale-[10%] group-hover:grayscale-0 transition-all duration-500"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Look%27s+Hub+Unisex+Salon+%26+Academy%2C+Silicon+City+Main+Rd%2C+Indore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2.5 btn-ghost-luxe !py-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MapPin size={16} /> Get Directions
            </a>

            <a
              href="https://wa.me/919516350601?text=Hello%20Look%27s%20Hub%20Salon%2C%20I%20would%20like%20to%20book%20an%20appointment.%20Could%20you%20please%20assist%20me%3F"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              aria-label="Chat with Look's Hub Salon on WhatsApp"
              className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 text-sm font-medium tracking-wide transition-all duration-300 !bg-[#25D366] hover:!bg-[#1ebe57] text-white shadow-soft hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: React.ReactNode; link?: string }) {
  const content = (
    <li className="flex items-start gap-5">
      <span className="w-11 h-11 grid place-items-center rounded-full bg-secondary text-[color:var(--gold)] shrink-0 transition-all duration-300 group-hover:bg-[color:var(--gold)] group-hover:text-[color:var(--charcoal)]">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground transition-colors duration-300 group-hover:text-[color:var(--gold)]">{label}</p>
        <div className="mt-1">{value}</div>
      </div>
    </li>
  );

  if (link) {
    return (
      <a href={link} className="block group cursor-pointer transition-transform duration-300 hover:translate-x-1">
        {content}
      </a>
    );
  }

  return content;
}
