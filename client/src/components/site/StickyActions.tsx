import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

export function StickyActions() {
  return (
    <>
      <a
        href="https://wa.me/919999999999"
        aria-label="WhatsApp"
        className="fixed bottom-24 md:bottom-6 right-5 z-40 w-14 h-14 rounded-full grid place-items-center bg-[#25D366] text-white shadow-[var(--shadow-soft)] hover:scale-105 transition-transform"
      >
        <MessageCircle size={22} />
      </a>
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden p-4 bg-background/95 backdrop-blur-xl border-t border-border">
        <Link to="/book" className="btn-gold w-full justify-center !py-4">
          Book Now
        </Link>
      </div>
    </>
  );
}
