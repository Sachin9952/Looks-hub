import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { salonWhatsApp } from "@/lib/data";

export function StickyActions() {
  return (
    <>
      <a
        href={salonWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-24 md:bottom-6 right-5 z-40 w-14 h-14 rounded-full grid place-items-center bg-[#25D366] text-white shadow-[var(--shadow-soft)] hover:scale-110 active:scale-95 transition-transform duration-300"
      >
        <MessageCircle size={22} />
      </a>
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden p-4 bg-background/95 backdrop-blur-xl border-t border-border">
        <Link 
          to="/book" 
          className="btn-gold w-full justify-center !py-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          Book Your Appointment
        </Link>
      </div>
    </>
  );
}
