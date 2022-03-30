const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = mongoose.Schema(
    {
        bookId: {
            type: ObjectId, 
            required: [true, 'Book id is required'],
            ref: 'Books'
        },
        reviewedBy: {
            type: String, 
            required: [true, 'Review by is required'],
            default: 'Guest',
            trim: true
        },
        reviewedAt: {
            type: Date, 
            required: [true, 'Review time is required']
        },
        rating: {
            type: Number, 
            min: 1, 
            max: 5, 
            required: [true, 'Rating is required']
        },
        review: {
            type: String,
            trim: true
        },
        isDeleted: {
            type: Boolean, 
            default: false
        },
    },
    { timestamps: true }
  );

  module.exports = mongoose.model('Review', reviewSchema)