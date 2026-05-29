import hair from "@/assets/service-hair.jpg";
import spa from "@/assets/service-spa.jpg";
import color from "@/assets/service-color.jpg";
import bridal from "@/assets/service-bridal.jpg";
import nails from "@/assets/service-nails.jpg";
import grooming from "@/assets/service-grooming.jpg";

export interface Service {
  id: string; // Slug, e.g., 'haircut'
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  startingPrice: number;
  duration: string;
  image: string;
  benefits: string[];
  processSteps: string[];
  idealFor: string[];
  afterCareTips: string[];
  relatedServices: string[]; // Slugs of related services
}

export const servicesData: Service[] = [
  {
    id: "haircut",
    title: "Haircut & Styling",
    category: "Hair Artistry",
    shortDescription: "Precision cuts tailored to your face & personality. Expert blow-dries & modern styling.",
    fullDescription: "Experience the ultimate transformation with our Signature Haircut & Styling service. Our master stylists analyze your hair texture, facial structure, and personal style to craft a custom haircut that is uniquely yours. Complete with a luxurious wash, relaxing scalp massage, and professional blow-dry styling.",
    startingPrice: 400,
    duration: "45 min",
    image: hair,
    benefits: [
      "Individually tailored styling to complement facial symmetry",
      "Removal of split ends to promote healthy hair growth",
      "Luxurious wash and soothing scalp massage included",
      "Styling education to replicate the salon look at home"
    ],
    processSteps: [
      "Personalized consultation and style selection",
      "Nourishing hair wash and clarifying conditioning treatment",
      "Precision cut using advanced scissor and razor techniques",
      "Blow-dry and editorial styling to finish"
    ],
    idealFor: [
      "Anyone seeking a style update or refresh",
      "Those wanting professional guidance on hair geometry",
      "Special occasions requiring expert styling"
    ],
    afterCareTips: [
      "Trim every 6-8 weeks to maintain the shape and health of your hair.",
      "Use professional salon-grade shampoo and conditioner suitable for your hair type.",
      "Apply heat protectant spray before using any blow-dryers or flat irons."
    ],
    relatedServices: ["spa", "color", "grooming"]
  },
  {
    id: "spa",
    title: "Hair Spa Treatment",
    category: "Restoration Rituals",
    shortDescription: "Deep nourishing ritual for damaged hair. Restores shine, softness, and vitality.",
    fullDescription: "Revitalize tired, dull, or chemically damaged hair with our premium Hair Spa Treatment. This intense therapy penetrates deep into the hair shafts to lock in moisture, nourish roots, and repair split ends. It also detoxifies the scalp to create the perfect foundation for strong, shiny hair.",
    startingPrice: 800,
    duration: "60 min",
    image: spa,
    benefits: [
      "Intense moisture infusion to counter dry and damaged hair",
      "Reduces frizz, making hair incredibly smooth and manageable",
      "Stimulates blood circulation in the scalp to strengthen hair roots",
      "Calming experience that relieves mental tension and stress"
    ],
    processSteps: [
      "Scalp and hair analysis to determine suitable spa cream",
      "Gentle cleansing wash followed by professional deep-conditioning cream application",
      "Steam therapy to open cuticles and allow deep nutrient penetration",
      "Relaxing acupressure head massage and cold rinse to seal cuticles"
    ],
    idealFor: [
      "Dry, damaged, or frizzy hair",
      "Chemically treated, colored, or straightened hair",
      "Individuals experiencing high stress or scalp dryness"
    ],
    afterCareTips: [
      "Avoid washing your hair for at least 24-48 hours after the spa treatment.",
      "Use sulfate-free shampoo to preserve the nourishing oils.",
      "Protect your hair from excessive sun exposure by wearing a scarf or using UV protectants."
    ],
    relatedServices: ["haircut", "color"]
  },
  {
    id: "color",
    title: "Hair Coloring",
    category: "Hair Artistry",
    shortDescription: "From subtle highlights to complete transformations. Professional color correction available.",
    fullDescription: "Express yourself with our premium Hair Coloring services. Whether you want to cover greys, add dimension with hand-painted balayage, or go bold with high-fashion colors, our expert colorists use nourishing, low-ammonia formulas that deliver brilliant shade performance while keeping your hair structure safe and healthy.",
    startingPrice: 1200,
    duration: "90 min",
    image: color,
    benefits: [
      "Rich, multi-dimensional shades customized to your skin tone",
      "Long-lasting formulas with high-fidelity color retention",
      "Enriched with protective ingredients to prevent moisture loss",
      "Full coverage of grey hair with a seamless, natural finish"
    ],
    processSteps: [
      "Color consultation and shade matching based on skin undertones",
      "Pre-color protection spray application",
      "Precise sectional color application by professional colorists",
      "Post-color wash, deep hydration mask, and lock-in shine blow-dry"
    ],
    idealFor: [
      "Those wanting to change or enhance their current hair color",
      "Individuals looking for grey hair coverage",
      "Anyone desiring dimensional highlights or modern balayage styling"
    ],
    afterCareTips: [
      "Use color-safe, sulfate-free shampoos and conditioners.",
      "Wash hair with lukewarm or cool water to prevent color fading.",
      "Limit thermal styling and always use a high-quality heat shield product."
    ],
    relatedServices: ["haircut", "spa"]
  },
  {
    id: "bridal",
    title: "Bridal & Event Makeup",
    category: "Premium Wellness",
    shortDescription: "Complete bridal packages with hairstyling, makeup & skin prep. Personalized consultation.",
    fullDescription: "Look breathtaking on your most special day. Our Bridal & Event Makeup packages are designed to make you feel radiant and look flawless. We offer high-definition, airbrush, and classic editorial makeup styles that photograph beautifully and stay perfect from morning to night. Packages include customized hairstyling, drape assistance, and premium skin preps.",
    startingPrice: 4500,
    duration: "180 min",
    image: bridal,
    benefits: [
      "Long-wearing, camera-ready makeup that resists sweat and tears",
      "Custom-tailored styles matching your outfit and personal comfort",
      "Includes hair styling, lash extensions, and outfit draping",
      "Relaxed, premium pampering session on the day of the event"
    ],
    processSteps: [
      "Prior consultation and mood-board selection",
      "Deep skin prep, hydration booster, and pore-refining primer",
      "Professional HD/Airbrush makeup application and setting",
      "Hairstyling, accessory placement, and final drape setup"
    ],
    idealFor: [
      "Brides and grooms preparing for their wedding day",
      "Guests attending formal evening events or galas",
      "Individuals scheduled for professional portfolio photoshoots"
    ],
    afterCareTips: [
      "Use a gentle oil-based makeup remover or micellar water to clean off products.",
      "Double-cleanse and apply a soothing nighttime moisturizer after removal.",
      "Schedule a hydrating facial 2-3 days post-event to refresh your pores."
    ],
    relatedServices: ["facial", "haircut"]
  },
  {
    id: "facial",
    title: "Signature Facial",
    category: "Rejuvenating Treatments",
    shortDescription: "Rejuvenating skin treatment for all skin types. Visible glow & refreshed appearance.",
    fullDescription: "Restore your skin's natural radiance with our Signature Facial. Combining advanced skincare products with soothing massage techniques, this treatment removes dead skin cells, clears clogged pores, and delivers intense hydration. Perfect for refreshing tired skin and achieving an instant, healthy glow.",
    startingPrice: 900,
    duration: "60 min",
    image: spa, // using spa image since original was imported as spa
    benefits: [
      "Deep pore cleansing and removal of blackheads/impurities",
      "Increases skin elasticity and promotes cellular regeneration",
      "Restores natural moisture balance and softens texture",
      "Reduces dark circles and puffiness around the eyes"
    ],
    processSteps: [
      "Gentle double-cleanse and skin type assessment",
      "Exfoliating scrub and gentle steam to open pores",
      "Extraction of impurities followed by a customized face mask",
      "Lymphatic drainage face massage and nourishing serum application"
    ],
    idealFor: [
      "Dull, dehydrated, or uneven skin tone",
      "Skin showing signs of environmental fatigue or stress",
      "Monthly skincare maintenance for all skin types"
    ],
    afterCareTips: [
      "Avoid applying makeup or heavy cosmetics for at least 12 hours.",
      "Wear broad-spectrum sunscreen (SPF 30+) when going outdoors.",
      "Drink plenty of water to maintain skin hydration from within."
    ],
    relatedServices: ["bridal", "spa"]
  },
  {
    id: "shaving",
    title: "Professional Shaving & Grooming",
    category: "Personalized Care",
    shortDescription: "Expert shaving technique with premium products. Smooth, comfortable experience.",
    fullDescription: "Indulge in a classic, luxury grooming tradition. Our Professional Shaving & Grooming service features hot towel treatment, pre-shave oil application, rich lathering, and a precision cut using single-use blades. Finished with a cold towel splash and high-end soothing balm to leave your skin feeling completely refreshed.",
    startingPrice: 350,
    duration: "30 min",
    image: nails, // original used nails for shaving
    benefits: [
      "Super close, clean shave without razor burns or irritation",
      "Hot towel treatment opens pores and softens facial hair",
      "Facial skin exfoliation during prep",
      "Relaxing neck and shoulder massage to close the session"
    ],
    processSteps: [
      "Hot towel steam and pre-shave oil massage",
      "Traditional brush lathering with moisturizing shaving soap",
      "Precision razor shaving with professional technique",
      "Cold towel press and soothing post-shave balm application"
    ],
    idealFor: [
      "Gentlemen looking for a premium, irritation-free clean shave",
      "Men wanting professional beard outline and styling shape",
      "Grooming prep before business meetings or formal events"
    ],
    afterCareTips: [
      "Apply alcohol-free moisturizer or balm daily to soothe the skin.",
      "Avoid touching your freshly shaved face to prevent bacteria transfer.",
      "Use cold water for facial washes during the first 24 hours."
    ],
    relatedServices: ["grooming", "haircut"]
  },
  {
    id: "grooming",
    title: "Men's Grooming Package",
    category: "Personalized Care",
    shortDescription: "Complete grooming including haircut, beard trim, and facial care.",
    fullDescription: "The ultimate package for the modern gentleman. This curated experience combines our signature precision haircut, customized beard design or professional shave, and a skin-clarifying mini facial clean-up. Step out looking sharp, refined, and completely put together.",
    startingPrice: 1200,
    duration: "75 min",
    image: grooming,
    benefits: [
      "All-in-one comprehensive grooming at a premium bundled value",
      "Perfect coordination of haircut style and beard outline",
      "Revitalizes facial skin and reduces shaving bumps",
      "Quick relaxation through hot towel and facial massage steps"
    ],
    processSteps: [
      "Consultation to sync hair cut and beard design preferences",
      "Precision haircut, shampoo, and styling wash",
      "Beard trimming, sculpting, or luxury shave with hot towels",
      "Exfoliating skin clean-up, face pack, and nourishing finish"
    ],
    idealFor: [
      "Men looking for a complete head-to-neck refresh",
      "Groomsmen and groom preparation before weddings",
      "Monthly comprehensive grooming maintenance"
    ],
    afterCareTips: [
      "Brush your beard and hair daily to keep style in place.",
      "Apply beard oil to hydrate the skin underneath and soften facial hair.",
      "Use face wash instead of soap to keep facial skin clear and hydrated."
    ],
    relatedServices: ["haircut", "shaving"]
  }
];
