import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { salonAddress, salonPhone, salonWhatsApp } from "@/lib/data";

export function Contact() {
  return (
    <section id="contact" className="py-28 md:py-36">
      <div className="container-luxe grid lg:grid-cols-2 gap-12 items-stretch">
        <div>
          <p className="eyebrow">Visit Us</p>
          <h2 className="mt-5 font-display text-4xl md:text-6xl max-w-md">Step into Look's Hub.</h2>
          <p className="mt-5 text-muted-foreground max-w-md">
            We're located in Indore's Silicon City area. Visit us for expert care, warm hospitality, and premium salon services. Everyone is welcome here.
          </p>

          <ul className="mt-12 space-y-7">
            <Row icon={<MapPin size={18} />} label="Address" value={salonAddress} />
            <Row icon={<Phone size={18} />} label="Phone" value={salonPhone} link={`tel:${salonPhone.replace(/\s+/g, '')}`} />
            <Row icon={<Clock size={18} />} label="Hours" value="Daily · 10:00 AM to 9:00 PM" />
          </ul>

          <a
            href={salonWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 btn-gold !bg-[#25D366] hover:!bg-[#1ebe57]"
          >
            <MessageCircle size={16} /> Chat on WhatsApp
          </a>
        </div>
        <div className="relative rounded-[1.75rem] overflow-hidden border border-border min-h-[420px] bg-secondary">
          <iframe
            title="Look's Hub Salon location"
            src="https://maps.google.com/maps?q=Look's%20Hub%20Unisex%20Salon%20%26%20Academy%20Silicon%20City%20Indore&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="absolute inset-0 w-full h-full"
            loading="lazy"
            allowFullScreen=""
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

function Row({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: string }) {
  const content = (
    <li className="flex items-start gap-5">
      <span className="w-11 h-11 grid place-items-center rounded-full bg-secondary text-[color:var(--gold)] shrink-0">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-base">{value}</p>
      </div>
    </li>
  );

  if (link) {
    return <a href={link} className="hover:opacity-80 transition-opacity">{content}</a>;
  }

  return content;
}
