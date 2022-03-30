const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId


const bookSchema = mongoose.Schema(
{ 
    title: {
        type    : String, 
        required: [true, 'Book title is required'],
        unique  : true,
        trim    : true
},
    excerpt: {
        type    : String, 
        required: [true, 'Book excerpt is required'],
        trim    : true
    }, 
    userId: {
        type    : ObjectId, 
        required: [true, 'userId is required'],
        ref     : 'users',
        trim    : true
    },
    ISBN: {
        type    : String, 
        required: [true, 'ISBN is required'],
        unique  : true,
        trim    : true
    },
    category: {
        type    : String, 
        required: [true, 'Category is required'],
        trim    : true
    },
    subcategory: {
        type    : String, 
        required: [true, 'Subcategory is required'],
        trim    : true
    },
    isDeleted: { 
        type    : Boolean, 
        default : false 
    },
    deletedAt: { 
        type    : Date, 
        default : null 
    },
    releasedAt: {
        type    : Date, 
        required: [true, 'Release data is required']
    },
    reviews: {
        type    : Number, 
        default : 0
    }
}, {timestamps: true}
)

module.exports = mongoose.model('book', bookSchema)