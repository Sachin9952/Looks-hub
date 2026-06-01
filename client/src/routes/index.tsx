import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { StickyActions } from "@/components/site/StickyActions";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Artists } from "@/components/site/Artists";
import { Pricing } from "@/components/site/Pricing";
import { Testimonials } from "@/components/site/Testimonials";
import { Offer } from "@/components/site/Offer";
import { InstaGrid } from "@/components/site/InstaGrid";
import { Contact } from "@/components/site/Contact";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Look's Hub Unisex Salon & Academy · Premium Salon & Academy Indore" },
      { name: "description", content: "Look's Hub Unisex Salon & Academy in Indore. Book premium unisex salon services and academy courses with expert stylists." },
      { property: "og:title", content: "Look's Hub Unisex Salon & Academy" },
      { property: "og:description", content: "Premium unisex salon & professional academy in Indore. Experience personalized care and styling." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Artists />
        <Pricing />
        <Offer />
        <Testimonials />
        <InstaGrid />
        <Contact />
      </main>
      <Footer />
      <StickyActions />
    </div>
  );
}
