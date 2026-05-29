import hair from "@/assets/service-hair.jpg";
import spa from "@/assets/service-spa.jpg";
import color from "@/assets/service-color.jpg";
import bridal from "@/assets/service-bridal.jpg";
import facial from "@/assets/service-spa.jpg";
import nails from "@/assets/service-nails.jpg";
import grooming from "@/assets/service-grooming.jpg";
import a1 from "@/assets/artist-1.jpg";
import a2 from "@/assets/artist-2.jpg";
import a3 from "@/assets/artist-3.jpg";
import a4 from "@/assets/artist-4.jpg";

// Real Look's Hub Salon Data
export const salonName = "Look's Hub";
export const salonPhone = "+91 99267 07048";
export const salonWhatsApp = "https://wa.me/919926707048";
export const salonInstagram = "https://instagram.com/lookshubsalon";
export const salonGoogleMaps = "https://maps.app.goo.gl/lookshub";
export const salonRating = 4.9;
export const salonReviewCount = 42;
export const salonAddress = "Sec-A, 54, Silicon City Main Rd, near Paliwal Dairy, Indore, Madhya Pradesh 452012";

export const services = [
  { id: "haircut", name: "Haircut & Styling", desc: "Precision cuts tailored to your face & personality. Expert blow-dries & modern styling.", price: 400, duration: "45 min", image: hair },
  { id: "spa", name: "Hair Spa Treatment", desc: "Deep nourishing ritual for damaged hair. Restores shine, softness, and vitality.", price: 800, duration: "60 min", image: spa },
  { id: "color", name: "Hair Coloring", desc: "From subtle highlights to complete transformations. Professional color correction available.", price: 1200, duration: "90 min", image: color },
  { id: "bridal", name: "Bridal & Event Makeup", desc: "Complete bridal packages with hairstyling, makeup & skin prep. Personalized consultation.", price: 4500, duration: "180 min", image: bridal },
  { id: "facial", name: "Signature Facial", desc: "Rejuvenating skin treatment for all skin types. Visible glow & refreshed appearance.", price: 900, duration: "60 min", image: facial },
  { id: "shaving", name: "Professional Shaving & Grooming", desc: "Expert shaving technique with premium products. Smooth, comfortable experience.", price: 350, duration: "30 min", image: nails },
  { id: "grooming", name: "Men's Grooming Package", desc: "Complete grooming including haircut, beard trim, and facial care.", price: 1200, duration: "75 min", image: grooming },
];

export const artists = [
  { id: "1", name: "Professional Team", specialty: "Hair Styling & Cutting", years: 5, rating: 4.9, image: a1 },
  { id: "2", name: "Expert Barbers", specialty: "Men's Grooming & Shaving", years: 6, rating: 4.9, image: a2 },
  { id: "3", name: "Skilled Colorists", specialty: "Hair Color & Treatment", years: 7, rating: 5.0, image: a3 },
  { id: "4", name: "Estheticians", specialty: "Facial & Skin Care", years: 5, rating: 4.8, image: a4 },
];

export const packages = [
  {
    name: "Quick Refresh",
    price: 800,
    tagline: "Perfect for busy schedules.",
    features: ["Haircut & Styling", "Hair Wash", "Basic Grooming"],
    popular: false,
  },
  {
    name: "Complete Makeover",
    price: 2200,
    tagline: "Our most popular choice.",
    features: ["Haircut & Styling", "Hair Spa Treatment", "Signature Facial"],
    popular: true,
  },
  {
    name: "Premium Bridal",
    price: 4500,
    tagline: "Your special day, perfectly styled.",
    features: [
      "Bridal & Event Makeup",
      "Hair Styling",
      "Facial Preparation",
      "Final Touch-Up",
    ],
    popular: false,
  },
];

export const testimonials = [
  { 
    name: "Vaishali Ghune", 
    role: "Regular Guest", 
    quote: "I recently visited Look's Hub and had an exceptional experience! The staff were friendly, attentive, and professional. The haircut, coloring, and treatments were done perfectly, and I loved the result. The ambiance was clean and relaxing.", 
    rating: 5 
  },
  { 
    name: "Navin Panwar", 
    role: "Satisfied Client", 
    quote: "Recently visited this salon and had a great experience. The hair spa, haircut, and shaving services were excellent. The staff was professional and friendly, and they made sure I was comfortable throughout. My hair felt soft and refreshed.", 
    rating: 5 
  },
  { 
    name: "Prachita Gawshinde", 
    role: "Regular Guest", 
    quote: "I really love this salon! They are excellent at everything from facials to hair grooming. The staff is attentive and caring. Highly recommend—you should definitely visit!", 
    rating: 5 
  },
];
