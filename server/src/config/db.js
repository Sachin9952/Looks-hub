import mongoose from 'mongoose'
import Service from '../models/Service.js'
import Artist from '../models/Artist.js'
import Gallery from '../models/Gallery.js'
import Testimonial from '../models/Testimonial.js'

const seedInitialData = async () => {
  try {
    // 1. Seed Services
    const serviceCount = await Service.countDocuments()
    if (serviceCount === 0) {
      console.log('Seeding initial services...')
      await Service.create([
        {
          name: "Haircut & Styling",
          category: "Hair Artistry",
          price: 400,
          duration: "45 min",
          description: "Precision cuts tailored to your face & personality. Expert blow-dries & modern styling.",
          isPopular: false,
          isActive: true
        },
        {
          name: "Hair Spa Treatment",
          category: "Restoration Rituals",
          price: 800,
          duration: "60 min",
          description: "Deep nourishing ritual for damaged hair. Restores shine, softness, and vitality.",
          isPopular: true,
          isActive: true
        },
        {
          name: "Hair Coloring",
          category: "Hair Artistry",
          price: 1200,
          duration: "90 min",
          description: "From subtle highlights to complete transformations. Professional color correction available.",
          isPopular: false,
          isActive: true
        },
        {
          name: "Bridal & Event Makeup",
          category: "Premium Wellness",
          price: 4500,
          duration: "180 min",
          description: "Complete bridal packages with hairstyling, makeup & skin prep. Personalized consultation.",
          isPopular: false,
          isActive: true
        },
        {
          name: "Signature Facial",
          category: "Rejuvenating Treatments",
          price: 900,
          duration: "60 min",
          description: "Rejuvenating skin treatment for all skin types. Visible glow & refreshed appearance.",
          isPopular: false,
          isActive: true
        },
        {
          name: "Professional Shaving & Grooming",
          category: "Personalized Care",
          price: 350,
          duration: "30 min",
          description: "Expert shaving technique with premium products. Smooth, comfortable experience.",
          isPopular: false,
          isActive: true
        },
        {
          name: "Men's Grooming Package",
          category: "Personalized Care",
          price: 1200,
          duration: "75 min",
          description: "Complete grooming including haircut, beard trim, and facial care.",
          isPopular: false,
          isActive: true
        }
      ])
      console.log('Services seeded successfully.')
    }

    // 2. Seed Gallery
    const galleryCount = await Gallery.countDocuments()
    if (galleryCount === 0 || galleryCount === 6) {
      console.log('Seeding initial gallery...')
      if (galleryCount === 6) {
        await Gallery.deleteMany({})
      }
      await Gallery.create([
        {
          title: "Hair Styling",
          category: "Hair Styling",
          imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600",
          type: "hair",
          isFeatured: true
        },
        {
          title: "Hair Color",
          category: "Hair Color",
          imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=600",
          type: "hair",
          isFeatured: true
        },
        {
          title: "Bridal Makeup",
          category: "Bridal Makeup",
          imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=600",
          type: "makeup",
          isFeatured: true
        },
        {
          title: "Creative Coloring",
          category: "Creative Coloring",
          imageUrl: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&q=80&w=600",
          type: "hair",
          isFeatured: true
        },
        {
          title: "Classic Shaving",
          category: "Classic Shaving",
          imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600",
          type: "grooming",
          isFeatured: true
        },
        {
          title: "Gentlemen's Grooming",
          category: "Gentlemen's Grooming",
          imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600",
          type: "grooming",
          isFeatured: true
        },
        {
          title: "Atelier Styling",
          category: "Atelier Styling",
          imageUrl: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600",
          type: "hair",
          isFeatured: true
        },
        {
          title: "Nourishing Hair Spa",
          category: "Nourishing Hair Spa",
          imageUrl: "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&q=80&w=600",
          type: "hair",
          isFeatured: true
        },
        {
          title: "Esthetics & Skincare",
          category: "Esthetics & Skincare",
          imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600",
          type: "skin",
          isFeatured: true
        }
      ])
      console.log('Gallery seeded successfully.')
    } else {
      console.log('Checking and correcting any broken gallery image URLs in existing database records...')
      // Update any legacy broken/invalid image URLs to verified working ones
      await Gallery.updateMany(
        { imageUrl: { $in: [
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1560869713-7d0a29430f23?auto=format&fit=crop&q=80&w=600"
        ] } },
        { imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=600" }
      )
      await Gallery.updateMany(
        { imageUrl: { $in: [
          "https://images.unsplash.com/photo-1605497746444-ac524b7a19d3?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600"
        ] } },
        { imageUrl: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&q=80&w=600" }
      )
      await Gallery.updateMany(
        { imageUrl: "https://images.unsplash.com/photo-1595475243628-12b23479368a?auto=format&fit=crop&q=80&w=600" },
        { imageUrl: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600" }
      )
      await Gallery.updateMany(
        { imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=600" },
        { imageUrl: "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&q=80&w=600" }
      )
    }

    // 3. Seed Testimonials
    const testimonialCount = await Testimonial.countDocuments()
    if (testimonialCount === 0) {
      console.log('Seeding initial testimonials...')
      await Testimonial.create([
        {
          customerName: "Vaishali Ghune",
          rating: 5,
          review: "I recently visited Look's Hub and had an exceptional experience! The staff were friendly, attentive, and professional. The haircut, coloring, and treatments were done perfectly, and I loved the result. The ambiance was clean and relaxing.",
          source: "Google Maps",
          isFeatured: true
        },
        {
          customerName: "Navin Panwar",
          rating: 5,
          review: "Recently visited this salon and had a great experience. The hair spa, haircut, and shaving services were excellent. The staff was professional and friendly, and they made sure I was comfortable throughout. My hair felt soft and refreshed.",
          source: "Google Maps",
          isFeatured: true
        },
        {
          customerName: "Prachita Gawshinde",
          rating: 5,
          review: "I really love this salon! They are excellent at everything from facials to hair grooming. The staff is attentive and caring. Highly recommend—you should definitely visit!",
          source: "Google Maps",
          isFeatured: true
        }
      ])
      console.log('Testimonials seeded successfully.')
    }
  } catch (err) {
    console.error('Error seeding initial data:', err)
  }
}

const backfillBookings = async () => {
  try {
    const bookingsWithoutRef = await Booking.find({
      $or: [
        { reference: { $exists: false } },
        { reference: null },
        { statusHistory: { $size: 0 } },
        { statusHistory: { $exists: false } },
        { durationMinutes: { $exists: false } },
        { durationMinutes: null }
      ]
    }).sort({ createdAt: 1 })

    if (bookingsWithoutRef.length > 0) {
      console.log(`Backfilling references/status history/durationMinutes for ${bookingsWithoutRef.length} bookings...`)
      for (const booking of bookingsWithoutRef) {
        if (!booking.reference) {
          const year = booking.date ? booking.date.split('-')[0] : new Date(booking.createdAt || Date.now()).getFullYear().toString();
          const prefix = `LH-${year}-`;
          
          const lastBooking = await Booking.findOne({
            reference: { $regex: new RegExp('^' + prefix) }
          }).sort({ reference: -1 });

          let sequence = 1;
          if (lastBooking && lastBooking.reference) {
            const parts = lastBooking.reference.split('-');
            const lastSeq = parseInt(parts[2], 10);
            if (!isNaN(lastSeq)) {
              sequence = lastSeq + 1;
            }
          }
          booking.reference = `${prefix}${String(sequence).padStart(5, '0')}`;
        }

        if (!booking.statusHistory || booking.statusHistory.length === 0) {
          const history = [
            {
              status: 'Booking Created',
              changedAt: booking.createdAt || new Date(),
              changedBy: 'Customer'
            }
          ];

          if (booking.status === 'confirmed') {
            history.push({
              status: 'Confirmed',
              changedAt: booking.updatedAt || new Date(),
              changedBy: 'Salon Admin'
            });
          } else if (booking.status === 'completed') {
            history.push({
              status: 'Confirmed',
              changedAt: booking.updatedAt || new Date(),
              changedBy: 'Salon Admin'
            });
            history.push({
              status: 'Completed',
              changedAt: booking.updatedAt || new Date(),
              changedBy: 'Salon Admin'
            });
          } else if (booking.status === 'cancelled') {
            history.push({
              status: 'Cancelled',
              changedAt: booking.updatedAt || new Date(),
              changedBy: 'Customer'
            });
          }

          booking.statusHistory = history;
        }

        if (!booking.durationMinutes) {
          let mins = 60;
          if (booking.duration) {
            const match = booking.duration.match(/(\d+)/);
            if (match) {
              mins = parseInt(match[1], 10);
            }
          }
          booking.durationMinutes = mins;
        }

        await booking.save();
      }
      console.log('Backfilling completed successfully.')
    }
  } catch (err) {
    console.error('Error backfilling bookings:', err)
  }
}

const backfillServicesAndArtists = async () => {
  try {
    const Service = mongoose.model('Service')
    const Artist = mongoose.model('Artist')

    // 1. Backfill Services
    const services = await Service.find({
      $or: [
        { durationMinutes: { $exists: false } },
        { durationMinutes: null }
      ]
    })
    if (services.length > 0) {
      console.log(`Backfilling durationMinutes for ${services.length} services...`)
      for (const service of services) {
        let mins = 60
        if (service.duration) {
          const match = service.duration.match(/(\d+)/)
          if (match) {
            mins = parseInt(match[1], 10)
          }
        }
        service.durationMinutes = mins
        await service.save()
      }
      console.log('Services durationMinutes backfill completed.')
    }

    // 2. Backfill Artists
    const artists = await Artist.find({
      $or: [
        { workingHours: { $exists: false } },
        { 'workingHours.start': { $exists: false } },
        { 'workingHours.end': { $exists: false } }
      ]
    })
    if (artists.length > 0) {
      console.log(`Backfilling workingHours for ${artists.length} artists...`)
      for (const artist of artists) {
        artist.workingHours = {
          start: artist.workingHours?.start || "09:00",
          end: artist.workingHours?.end || "18:00"
        }
        await artist.save()
      }
      console.log('Artists workingHours backfill completed.')
    }
  } catch (err) {
    console.error('Error backfilling services and artists:', err)
  }
}

export const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI
    if (!dbUri) {
      throw new Error('Database connection string (MONGO_URI or MONGODB_URI) is missing in environment variables.')
    }
    const conn = await mongoose.connect(dbUri)
    console.log(`MongoDB connected: ${conn.connection.host}`)
    
    // Run background seeding
    await seedInitialData()
    // Run backfill for bookings
    await backfillBookings()
    // Run backfill for services and artists
    await backfillServicesAndArtists()
    
    return conn
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    throw error
  }
}
