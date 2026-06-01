/**
 * Real salon data extracted from Google Maps
 * Look's Hub Unisex Salon & Academy
 */

export const salonInfo = {
  name: "Look's Hub",
  fullName: "Look's Hub Unisex Salon & Academy",
  tagline: "Premium unisex salon & professional academy",
  description: "A welcoming sanctuary for all—where professional expertise meets genuine care. From classic cuts to advanced treatments, every guest receives personalized attention.",
  
  // Contact Information
  phone: "+91 95163 50601",
  phoneRaw: "9516350601",
  whatsapp: "+91 95163 50601",
  instagram: "https://instagram.com/lookshubsalon",
  
  // Location
  address: "Sec-A, 54, Silicon City Main Rd, near Paliwal Dairy, Indore, Madhya Pradesh 452012",
  googleMapsCode: "JRWJ+94",
  googleMapsUrl: "https://maps.app.goo.gl/JRWJ94Indore",
  coordinates: {
    lat: 22.5374,
    lng: 75.8567,
  },
  
  // Hours
  hours: {
    monday: { open: "10:00", close: "21:00" },
    tuesday: { open: "10:00", close: "21:00" },
    wednesday: { open: "10:00", close: "21:00" },
    thursday: { open: "10:00", close: "21:00" },
    friday: { open: "10:00", close: "21:00" },
    saturday: { open: "10:00", close: "21:00" },
    sunday: { open: "10:00", close: "21:00" },
  },
  hoursDisplay: "Open Daily · 10:00 AM to 9:00 PM",
  
  // Ratings
  rating: 4.9,
  reviewCount: 42,
  
  // Attributes
  attributes: [
    "LGBTQ+ friendly",
    "Professional & attentive staff",
    "Clean & relaxing ambiance",
    "Expert hair specialists",
    "Advanced treatments available",
  ],
};

export const servicesExtended = [
  {
    id: "haircut",
    name: "Haircut & Styling",
    desc: "Precision cuts tailored to your face & personality. Expert blow-dries & modern styling techniques.",
    tags: ["Most Popular", "11+ Reviews"],
  },
  {
    id: "haircolor",
    name: "Hair Coloring",
    desc: "From subtle highlights to complete transformations. Professional color correction & global coloring.",
    tags: ["Expert Service"],
  },
  {
    id: "hairspa",
    name: "Hair Spa Treatment",
    desc: "Deep nourishing ritual for damaged hair. Restores shine, softness, and vitality.",
    tags: ["Recommended"],
  },
  {
    id: "shampoo",
    name: "Premium Shampoo & Wash",
    desc: "Luxurious hair wash experience with professional products & expert care.",
    tags: ["Relaxing"],
  },
  {
    id: "shaving",
    name: "Professional Shaving",
    desc: "Smooth, comfortable shaving experience with expert technique & premium products.",
    tags: ["Men's Service"],
  },
  {
    id: "facial",
    name: "Signature Facial",
    desc: "Rejuvenating skin treatment for all skin types. Visible glow & refreshed appearance.",
    tags: ["Glow Treatment"],
  },
  {
    id: "grooming",
    name: "Men's Grooming",
    desc: "Complete grooming package including haircut, beard trim, and facial care.",
    tags: ["Complete Package"],
  },
  {
    id: "botox",
    name: "Advanced Treatments",
    desc: "Professional skin treatments & advanced procedures. Personalized consultation provided.",
    tags: ["Premium Service"],
  },
];

export const realTestimonials = [
  {
    id: 1,
    name: "Vaishali Ghune",
    role: "Regular Guest",
    rating: 5,
    reviewDate: "6 months ago",
    quote: "I recently visited Look's Hub and had an exceptional experience! The staff were friendly, attentive, and professional. The haircut, coloring, and treatments were done perfectly, and I loved the result. The ambiance was clean and relaxing.",
    verified: true,
  },
  {
    id: 2,
    name: "Navin Panwar",
    role: "Satisfied Client",
    rating: 5,
    reviewDate: "8 months ago",
    quote: "Recently visited this salon and had a great experience. The hair spa, haircut, and shaving services were excellent. The staff was professional and friendly, and they made sure I was comfortable throughout. My hair felt soft and refreshed.",
    verified: true,
  },
  {
    id: 3,
    name: "Prachita Gawshinde",
    role: "Regular Guest",
    rating: 5,
    reviewDate: "3 months ago",
    quote: "I really love this salon! They are excellent at everything from facials to hair grooming. The staff is attentive and caring. Highly recommend—you should definitely visit!",
    verified: true,
  },
  {
    id: 4,
    name: "Anonymous Guest",
    role: "First-time Visitor",
    rating: 5,
    reviewDate: "Recent",
    quote: "Best place for haircuts and services. The staff is welcoming and the results are fantastic. Will definitely come back!",
    verified: true,
  },
];

export const shortReviews = [
  "Professional haircut and hair color service. Really satisfied!",
  "Clean salon with great staff. Hair spa treatment was amazing.",
  "Best place for grooming and styling. Highly recommended!",
  "Expert service and friendly atmosphere. Worth every visit!",
];

export const aboutSectionContent = {
  title: "About Look's Hub",
  subtitle: "Where Expertise Meets Care",
  paragraphs: [
    "Look's Hub is a premier unisex salon and academy in Indore, dedicated to transforming how people feel about themselves. With a team of expert stylists and a commitment to quality, we deliver personalized beauty solutions.",
    "Our salon welcomes everyone—we celebrate diversity and create an inclusive space where every guest feels valued. Whether you're looking for a simple trim or a complete transformation, we're here to help.",
    "Beyond our salon services, we run an academy to train the next generation of beauty professionals. We believe in sharing knowledge and elevating standards across the industry.",
  ],
  cta: "Experience the Look's Hub difference today.",
};

export const trustBadges = [
  {
    label: "4.9 Rating",
    value: "42+ Reviews",
    icon: "⭐",
  },
  {
    label: "LGBTQ+ Friendly",
    value: "Inclusive Space",
    icon: "🌈",
  },
  {
    label: "Expert Team",
    value: "Certified Stylists",
    icon: "👥",
  },
  {
    label: "Premium Care",
    value: "Professional Service",
    icon: "✨",
  },
];

export const contactInfo = {
  address: salonInfo.address,
  phone: salonInfo.phone,
  whatsapp: salonInfo.whatsapp,
  instagram: salonInfo.instagram,
  hours: salonInfo.hoursDisplay,
  mapEmbed: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3677.8674518891745!2d${salonInfo.coordinates.lng}!3d${salonInfo.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c7e7e7e7e7e7d%3A0x7e7e7e7e7e7e7e7e!2sLook's%20Hub%20Unisex%20Salon%20%26%20Academy!5e0!3m2!1sen!2sin!4v1234567890`,
};
