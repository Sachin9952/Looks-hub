import React, { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { StickyActions } from "@/components/site/StickyActions";
import { Hero } from "@/components/site/Hero";
import { Offer } from "@/components/site/Offer";
import {
  ServicesSkeleton,
  ArtistsSkeleton,
  PricingSkeleton,
  TestimonialsSkeleton,
  InstaGridSkeleton,
  ContactSkeleton,
} from "@/components/site/skeletons";

const Services = React.lazy(() =>
  import("@/components/site/Services").then((m) => ({ default: m.Services }))
);
const Artists = React.lazy(() =>
  import("@/components/site/Artists").then((m) => ({ default: m.Artists }))
);
const Pricing = React.lazy(() =>
  import("@/components/site/Pricing").then((m) => ({ default: m.Pricing }))
);
const Testimonials = React.lazy(() =>
  import("@/components/site/Testimonials").then((m) => ({ default: m.Testimonials }))
);
const InstaGrid = React.lazy(() =>
  import("@/components/site/InstaGrid").then((m) => ({ default: m.InstaGrid }))
);
const Contact = React.lazy(() =>
  import("@/components/site/Contact").then((m) => ({ default: m.Contact }))
);

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
        <Suspense fallback={<ServicesSkeleton />}>
          <Services />
        </Suspense>
        <Suspense fallback={<ArtistsSkeleton />}>
          <Artists />
        </Suspense>
        <Suspense fallback={<PricingSkeleton />}>
          <Pricing />
        </Suspense>
        <Offer />
        <Suspense fallback={<TestimonialsSkeleton />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<InstaGridSkeleton />}>
          <InstaGrid />
        </Suspense>
        <Suspense fallback={<ContactSkeleton />}>
          <Contact />
        </Suspense>
      </main>
      <Footer />
      <StickyActions />
    </div>
  );
}
