import Artist from '../models/Artist.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendSuccess, sendError } from '../utils/responseHandler.js'

// @desc    Get all artists/stylists
// @route   GET /api/artists
// @access  Public
export const getArtists = asyncHandler(async (req, res) => {
  let artists = await Artist.find({}).sort({ createdAt: -1 })
  
  if (artists.length === 0) {
    const dummyArtists = [
      { name: "Professional Team", specialty: "Hair Styling & Cutting", years: 5, rating: 4.9, image: "/uploads/artist-1.jpg" },
      { name: "Expert Barbers", specialty: "Men's Grooming & Shaving", years: 6, rating: 4.9, image: "/uploads/artist-2.jpg" },
      { name: "Skilled Colorists", specialty: "Hair Color & Treatment", years: 7, rating: 5.0, image: "/uploads/artist-3.jpg" },
      { name: "Estheticians", specialty: "Facial & Skin Care", years: 5, rating: 4.8, image: "/uploads/artist-4.jpg" }
    ]
    artists = await Artist.insertMany(dummyArtists)
  }

  sendSuccess(res, artists, 'Artists retrieved successfully')
})

// @desc    Create new artist/stylist
// @route   POST /api/artists
// @access  Private (Admin)
export const createArtist = asyncHandler(async (req, res) => {
  const { name, specialty, years, rating, image } = req.body

  const artist = await Artist.create({
    name,
    specialty,
    years: Number(years),
    rating: Number(rating) || 5.0,
    image
  })

  sendSuccess(res, artist, 'Artist created successfully', 201)
})

// @desc    Delete artist/stylist
// @route   DELETE /api/artists/:id
// @access  Private (Admin)
export const deleteArtist = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.params.id)

  if (!artist) {
    return sendError(res, 'Artist not found', 404)
  }

  await artist.deleteOne()
  sendSuccess(res, null, 'Artist deleted successfully')
})
