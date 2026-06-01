import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Clock, Calendar, ShieldCheck, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { servicesData } from "@/data/servicesData";
import { salonWhatsApp } from "@/lib/data";
import { getServiceImage } from "@/components/site/Services";

export const Route = createFileRoute("/services/$serviceId")({
  head: ({ params }) => {
    const service = servicesData.find((s) => s.id === params.serviceId);
    return {
      meta: [
        { title: service ? `${service.title} · Premium Service · Look's Hub` : "Service Not Found · Look's Hub" },
        { name: "description", content: service ? service.shortDescription : "Service details page." },
      ],
    };
  },
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const { serviceId } = Route.useParams();
  const [service, setCurrentService] = useState<any>(null);
  const [relatedServicesList, setRelatedServicesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/services`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const allDbServices = data.data;
            // Find current service
            const dbMatch = allDbServices.find((s: any) => s._id === serviceId || s.name.toLowerCase().replace(/[^a-z0-9]/g, "") === serviceId.toLowerCase().replace(/[^a-z0-9]/g, ""));
            
            if (dbMatch) {
              const staticMatch = servicesData.find(
                (sd) => sd.title.toLowerCase() === dbMatch.name.toLowerCase()
              );
              
              const normalized = {
                id: dbMatch._id,
                title: dbMatch.name,
                category: dbMatch.category,
                fullDescription: dbMatch.description || staticMatch?.fullDescription || dbMatch.name,
                startingPrice: dbMatch.price,
                duration: dbMatch.duration,
                image: getServiceImage(dbMatch.name),
                benefits: staticMatch?.benefits || ["Premium experience", "Expert stylists"],
                afterCareTips: staticMatch?.afterCareTips || ["Follow expert stylist advice"],
                idealFor: staticMatch?.idealFor || ["Anyone seeking premium styling"],
                processSteps: staticMatch?.processSteps || ["Consultation", "Treatment", "Finish"]
              };
              
              // Load related services
              const relatedSlugs = staticMatch?.relatedServices || [];
              const relatedDbItems = allDbServices.filter((s: any) => {
                if (s._id === dbMatch._id) return false;
                const match = servicesData.find(sd => sd.title.toLowerCase() === s.name.toLowerCase());
                return match && relatedSlugs.includes(match.id);
              });
              
              const mappedRelated = relatedDbItems.map((s: any) => {
                const match = servicesData.find(sd => sd.title.toLowerCase() === s.name.toLowerCase());
                return {
                  id: s._id,
                  title: s.name,
                  category: s.category,
                  shortDescription: s.description || match?.shortDescription || s.name,
                  startingPrice: s.price,
                  duration: s.duration,
                  image: getServiceImage(s.name)
                };
              });

              setCurrentService(normalized);
              setRelatedServicesList(mappedRelated);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load service detail from API:", err);
      }

      // Static fallback
      const staticMatch = servicesData.find((s) => s.id === serviceId);
      if (staticMatch) {
        setCurrentService({
          id: staticMatch.id,
          title: staticMatch.title,
          category: staticMatch.category,
          fullDescription: staticMatch.fullDescription,
          startingPrice: staticMatch.startingPrice,
          duration: staticMatch.duration,
          image: staticMatch.image,
          benefits: staticMatch.benefits,
          afterCareTips: staticMatch.afterCareTips,
          idealFor: staticMatch.idealFor,
          processSteps: staticMatch.processSteps
        });
        const related = servicesData.filter((s) => staticMatch.relatedServices.includes(s.id));
        setRelatedServicesList(related.map(s => ({
          id: s.id,
          title: s.title,
          category: s.category,
          shortDescription: s.shortDescription,
          startingPrice: s.startingPrice,
          duration: s.duration,
          image: s.image
        })));
      }
      setLoading(false);
    };
    loadService();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--cream)] text-[color:var(--charcoal)] flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-24">
          <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[color:var(--gold)] rounded-full mb-4"></div>
          <p className="text-xs uppercase tracking-widest text-[color:var(--charcoal)]/50">Loading details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Elegant 404 state if service not found
  if (!service) {
    return (
      <div className="min-h-screen bg-[color:var(--cream)] text-[color:var(--charcoal)] flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4">
          <div className="max-w-md text-center">
            <span className="text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold">
              ERROR 404
            </span>
            <h1 className="mt-4 font-display text-4xl md:text-5xl font-light tracking-tight text-[color:var(--charcoal)]">
              Service Not Found
            </h1>
            <p className="mt-4 text-base text-[color:var(--charcoal)]/70 font-light leading-relaxed">
              We couldn't find the premium service you're looking for. It may have been renamed or is temporarily unavailable.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[color:var(--charcoal)] text-[color:var(--cream)] hover:bg-[color:var(--gold)] hover:text-[color:var(--charcoal)] transition-all duration-300 font-semibold text-sm tracking-wide uppercase"
              >
                <ArrowLeft size={16} /> All Services
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-[color:var(--charcoal)]/20 hover:border-[color:var(--charcoal)]/60 text-[color:var(--charcoal)]/80 hover:text-[color:var(--charcoal)] transition-all duration-300 font-semibold text-sm tracking-wide uppercase"
              >
                Go Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Create customized WhatsApp inquiry message link
  const encodedText = encodeURIComponent(
    `Hello Look's Hub! I am interested in inquiring about the "${service.title}" service.`
  );
  const whatsAppInquiryUrl = `${salonWhatsApp || "https://wa.me/919516350601"}?text=${encodedText}`;

  return (
    <div className="min-h-screen bg-[color:var(--cream)] text-[color:var(--charcoal)] overflow-x-hidden">
      <Navbar />
      
      <main className="pt-32 pb-24">
        {/* Top Navigation / Breadcrumbs */}
        <div className="container-luxe mb-10 md:mb-16">
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--charcoal)]/60 hover:text-[color:var(--charcoal)] transition-colors"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Services
          </Link>
        </div>

        {/* Hero Section of Service */}
        <section className="container-luxe grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20 md:mb-32">
          {/* Large Premium Service Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-[color:var(--charcoal)]/10 shadow-[var(--shadow-soft)] bg-[color:var(--charcoal)]/5"
          >
            <img
              src={service.image}
              alt={service.title}
              className="w-full aspect-[4/3] md:aspect-[3/2] lg:aspect-[4/5] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/30 to-transparent pointer-events-none" />
            <span className="absolute top-6 left-6 z-20 text-xs uppercase tracking-widest bg-[color:var(--cream)]/90 backdrop-blur-sm text-[color:var(--charcoal)] px-4 py-2 rounded-full font-semibold border border-[color:var(--charcoal)]/5">
              {service.category}
            </span>
          </motion.div>

          {/* Details Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <span className="text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold mb-4">
              LUXURY RITUAL
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6 leading-tight text-[color:var(--charcoal)]">
              {service.title}
            </h1>
            <p className="text-lg text-[color:var(--charcoal)]/80 leading-relaxed font-light mb-8">
              {service.fullDescription}
            </p>

            {/* Stats Block */}
            <div className="grid grid-cols-2 gap-6 border-y border-[color:var(--charcoal)]/10 py-6 mb-8">
              <div>
                <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--charcoal)]/50 block font-semibold mb-1">
                  Starting From
                </span>
                <span className="text-3xl font-light text-[color:var(--gold)]">
                  ₹{service.startingPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--charcoal)]/50 block font-semibold mb-1">
                  Duration
                </span>
                <span className="text-xl font-light text-[color:var(--charcoal)]/80 flex items-center gap-2 mt-1">
                  <Clock size={18} className="text-[color:var(--gold)]" />
                  {service.duration}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                to="/book"
                search={{ service: service.id }}
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[color:var(--gold)] text-[color:var(--charcoal)] hover:bg-[color:var(--gold-soft)] transition-all duration-300 font-semibold text-sm tracking-wide uppercase flex-1 shadow-[var(--shadow-soft)]"
              >
                Book This Service
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={whatsAppInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-[color:var(--charcoal)]/30 hover:border-[color:var(--charcoal)]/60 text-[color:var(--charcoal)]/85 hover:text-[color:var(--charcoal)] transition-all duration-300 font-semibold text-sm tracking-wide uppercase flex-1"
              >
                WhatsApp Inquiry
              </a>
            </div>

            {/* Ideal For */}
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--charcoal)]/50 block font-semibold mb-3">
                Ideal For
              </span>
              <div className="flex flex-wrap gap-2">
                {service.idealFor.map((item: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs bg-[color:var(--charcoal)]/5 border border-[color:var(--charcoal)]/10 text-[color:var(--charcoal)]/80 px-4 py-2 rounded-full font-light"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Details & Ritual Information Tabs/Sections */}
        <section className="bg-[color:var(--cream)] border-t border-[color:var(--charcoal)]/5 py-20 md:py-28">
          <div className="container-luxe grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
            
            {/* Left: Benefits & Aftercare */}
            <div className="lg:col-span-6 space-y-12">
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-light mb-6 text-[color:var(--charcoal)] flex items-center gap-3">
                  <ShieldCheck className="text-[color:var(--gold)]" size={24} />
                  Key Benefits
                </h3>
                <ul className="space-y-4">
                  {service.benefits.map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3.5 text-sm md:text-base text-[color:var(--charcoal)]/85 font-light leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-[color:var(--gold)]/10 text-[color:var(--gold)] grid place-items-center shrink-0 mt-0.5">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <h3 className="font-display text-2xl md:text-3xl font-light mb-6 text-[color:var(--charcoal)] flex items-center gap-3">
                  <HelpCircle className="text-[color:var(--gold)]" size={24} />
                  Aftercare Tips
                </h3>
                <ul className="space-y-4">
                  {service.afterCareTips.map((tip: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3.5 text-sm md:text-base text-[color:var(--charcoal)]/85 font-light leading-relaxed border-l-2 border-[color:var(--gold)]/30 pl-4 py-1">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: The Process Steps */}
            <div className="lg:col-span-6">
              <div className="bg-[color:var(--cream)] border border-[color:var(--charcoal)]/10 rounded-2xl p-8 md:p-10 shadow-[var(--shadow-soft)]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold)] font-semibold block mb-2">
                  THE MAISON LUMIÈRE EXPERIENCE
                </span>
                <h3 className="font-display text-2xl md:text-3xl font-light mb-8 text-[color:var(--charcoal)]">
                  Step-by-Step Process
                </h3>

                <div className="relative border-l border-[color:var(--charcoal)]/10 pl-6 ml-3 space-y-10">
                  {service.processSteps.map((step: string, idx: number) => (
                    <div key={idx} className="relative">
                      {/* Step Indicator Dot */}
                      <span className="absolute -left-[37px] top-0.5 w-6 h-6 rounded-full bg-[color:var(--charcoal)] text-[color:var(--cream)] text-[10px] grid place-items-center font-bold border-4 border-[color:var(--cream)] shadow-sm">
                        {idx + 1}
                      </span>
                      <p className="text-sm md:text-base text-[color:var(--charcoal)]/90 font-light leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Related Services Section */}
        {relatedServicesList.length > 0 && (
          <section className="container-luxe pt-20 border-t border-[color:var(--charcoal)]/10">
            <h3 className="font-display text-3xl font-light text-center mb-12 text-[color:var(--charcoal)]">
              Complementary Rituals
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedServicesList.map((relService) => (
                <Link
                  key={relService.id}
                  to="/services/$serviceId"
                  params={{ serviceId: relService.id }}
                  className="group flex flex-col bg-[color:var(--cream)] border border-[color:var(--charcoal)]/10 rounded-xl overflow-hidden hover:shadow-[var(--shadow-soft)] transition-all duration-350"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-[color:var(--charcoal)]/5">
                    <img
                      src={relService.image}
                      alt={relService.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[color:var(--gold)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-display text-xl font-light mb-2 text-[color:var(--charcoal)] group-hover:text-[color:var(--gold)] transition-colors">
                        {relService.title}
                      </h4>
                      <p className="text-xs text-[color:var(--charcoal)]/60 font-light line-clamp-2 mb-4">
                        {relService.shortDescription}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[color:var(--charcoal)]/5">
                      <span className="text-sm font-semibold text-[color:var(--gold)]">
                        ₹{relService.startingPrice}
                      </span>
                      <span className="text-xs text-[color:var(--charcoal)]/60 uppercase tracking-wider font-semibold group-hover:text-[color:var(--charcoal)] transition-colors flex items-center gap-1">
                        View Details <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
