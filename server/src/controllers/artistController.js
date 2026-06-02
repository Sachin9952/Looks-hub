import Artist from '../models/Artist.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendSuccess, sendError } from '../utils/responseHandler.js'
import { cloudinary } from '../config/cloudinary.js'

// @desc    Get all artists/stylists
// @route   GET /api/artists
// @access  Public
export const getArtists = asyncHandler(async (req, res) => {
  let artists = await Artist.find({}).sort({ createdAt: -1 })

  if (artists.length === 0) {
    const dummyArtists = [
      {
        name: "Professional Team",
        specialty: "Hair Styling & Cutting",
        years: 5,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600",
        imagePublicId: "barbers/dummy-team"
      },
      {
        name: "Expert Barbers",
        specialty: "Men's Grooming & Shaving",
        years: 6,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600",
        imagePublicId: "barbers/dummy-barber"
      },
      {
        name: "Skilled Colorists",
        specialty: "Hair Color & Treatment",
        years: 7,
        rating: 5.0,
        imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=600",
        imagePublicId: "barbers/dummy-colorist"
      },
      {
        name: "Estheticians",
        specialty: "Facial & Skin Care",
        years: 5,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600",
        imagePublicId: "barbers/dummy-esthetician"
      }
    ]
    artists = await Artist.insertMany(dummyArtists)
  }

  sendSuccess(res, artists, 'Artists retrieved successfully')
})

// @desc    Create new artist/stylist
// @route   POST /api/artists
// @access  Private (Admin)
export const createArtist = asyncHandler(async (req, res) => {
  const { name, specialty, years, rating, imageUrl, imagePublicId } = req.body

  const artist = await Artist.create({
    name,
    specialty,
    years: Number(years),
    rating: Number(rating) || 5.0,
    imageUrl,
    imagePublicId
  })

  sendSuccess(res, artist, 'Artist created successfully', 201)
})

// @desc    Update artist/stylist
// @route   PUT /api/artists/:id
// @access  Private (Admin)
export const updateArtist = asyncHandler(async (req, res) => {
  const { name, specialty, years, rating, imageUrl, imagePublicId } = req.body
  const artist = await Artist.findById(req.params.id)

  if (!artist) {
    return sendError(res, 'Artist not found', 404)
  }

  // If the image is being replaced, delete the old image from Cloudinary to avoid storage leaks
  if (imagePublicId && artist.imagePublicId && imagePublicId !== artist.imagePublicId) {
    // Only attempt deletion if it's not a placeholder/dummy image
    if (!artist.imagePublicId.startsWith('barbers/dummy')) {
      try {
        await cloudinary.uploader.destroy(artist.imagePublicId)
      } catch (err) {
        console.error(`Failed to delete old image ${artist.imagePublicId} from Cloudinary:`, err)
      }
    }
  }

  artist.name = name || artist.name
  artist.specialty = specialty || artist.specialty
  artist.years = years !== undefined ? Number(years) : artist.years
  artist.rating = rating !== undefined ? Number(rating) : artist.rating
  if (imageUrl) artist.imageUrl = imageUrl
  if (imagePublicId) artist.imagePublicId = imagePublicId

  const updatedArtist = await artist.save()
  sendSuccess(res, updatedArtist, 'Artist updated successfully')
})

// @desc    Delete artist/stylist
// @route   DELETE /api/artists/:id
// @access  Private (Admin)
export const deleteArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.params.id)

  if (!artist) {
    return sendError(res, 'Artist not found', 404)
  }

  // Delete the image from Cloudinary if it's a real uploaded image
  if (artist.imagePublicId && !artist.imagePublicId.startsWith('barbers/dummy')) {
    try {
      await cloudinary.uploader.destroy(artist.imagePublicId)
    } catch (err) {
      console.error(`Failed to delete image ${artist.imagePublicId} from Cloudinary:`, err)
    }
  }

  await artist.deleteOne()
  sendSuccess(res, null, 'Artist deleted successfully')
})

