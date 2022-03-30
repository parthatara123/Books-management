const BookModel = require("../model/bookModel");
const ReviewModel = require("../model/reviewModel");
const mongoose = require("mongoose");
const moment = require("moment");

//Function to check required values
const isValid = function (value) {
  if (typeof value == "undefined" || typeof value == null) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  return true;
};

//ObjectId validation checking
const isValidIdType = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

//Route handler function for creating book review
const createBookReview = async function (req, res) {
  try {
    const inputQuery = req.query;
    const inputBookId = req.params.bookId;
    const inputBody = req.body;

    //validation of input requests

    if (Object.keys(inputBody).length === 0) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter review" });
    }

    if (Object.keys(inputQuery) > 0) {
      return res.status(400).send({
        status: false,
        message: "Input through request body is not allowed",
      });
    }

    //validation of input book id from path params
    if (!inputBookId) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide input id" });
    }

    if (!isValidIdType(inputBookId)) {
      return res
        .status(400)
        .send({ status: false, message: "Book id is required" });
    }

    //checking whether book exists or not
    let bookById = await BookModel.findOne({
      _id: inputBookId,
      isDeleted: false,
    });

    if (!bookById) {
      return res
        .status(400)
        .send({ status: false, message: "No book exists by given Id" });
    }

    //Validation of review property
    if (
      inputBody.hasOwnProperty("review") != true &&
      typeof inputBody.review != "string" &&
      inputBody.review.trim().length == 0
    ) {
      return res.status(400).send({
        status: false,
        message: "Review type is invalid, please provide review in string",
      });
    }

    //validation of reviewed by property
    if (
      inputBody.hasOwnProperty("reviewedBy") &&
      !isValid(inputBody.reviewedBy)
    ) {
      inputBody.reviewedBy = "Guest";
    }

    //Validation of rating
    if (inputBody.hasOwnProperty("rating") == false) {
      return res
        .status(400)
        .send({ status: false, message: "Book rating is required" });
    }

    //Checking whether given rating is between 1 to 5
    if (inputBody.rating < 1 || inputBody.rating > 5) {
      return res
        .status(400)
        .send({ status: false, message: "Book rating must be from 1 to 5" });
    }

    //Adding properties to inputBody data
    inputBody.bookId = inputBookId;
    inputBody.isDeleted = false;
    inputBody.reviewedAt = moment().format("YYYY-MM-DD, h:mm:ss a");

    //creating new review
    const newReview = await ReviewModel.create(inputBody);

    //updating ratings count in book model after creating review
    const bookWithNumberOfReviews = await BookModel.findOneAndUpdate(
      { _id: inputBookId, isDeleted: false, deletedAt: null },
      { $inc: { reviews: 1 } },
      { new: true }
    );

    res.status(201).send({
      status: true,
      message: "Review added successfully",
      data: newReview,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const updateReview = async function (req, res) {
  try {
    const inputBookId = req.params.bookId;
    const inputReviewId = req.params.reviewId;
    const inputBody = req.body

    if(Object.keys(inputBody).length === 0){
      return res.status(400).send({status: false, message: "please provide data to be updated"})
    }

    //Book must be available in DB

    if(!isValidIdType(inputBookId)){
      return res.status(400).send({status:false, message: 'Invalid Book id'})
    }

    const bookByBookId = await BookModel.findOne({_id: inputBookId, isDeleted: false, deletedAt: null});

    if (!bookByBookId) {
      return res
        .status(400)
        .send({ status: false, message: `No book found by ${inputBookId}` });
    }

    //ReviewID must be valid & must be available in DB

    if(!isValidIdType(inputReviewId)){
      return res.status(400).send({status:false, message: 'Invalid review id'})
    }

    const reviewByReviewId = await ReviewModel.findOne({_id: inputReviewId, isDeleted: false});

    if (!reviewByReviewId) {
      return res
        .status(400)
        .send({
          status: false,
          message: `No review found by ${inputReviewId}`,
        });
    }

    //Update data will come through input body

    const { reviewedBy, rating, review } = inputBody;

    const updates = {};
    //Validation of various updating properties

    if (inputBody.hasOwnProperty("reviewedBy")) {
      if (isValid(reviewedBy) && typeof reviewedBy == "string") {
        updates["reviewedBy"] = reviewedBy.trim();
      } else {
        return res
          .status(400)
          .send({ status: false, message: "Reviewer's name is not valid" });
      }
    }

    //Validation of rating
    if (inputBody.hasOwnProperty("rating") == false) {
      return res
        .status(400)
        .send({ status: false, message: "Book rating is required" });
    }

    //Checking whether given rating is between 1 to 5
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .send({ status: false, message: "Book rating must be from 1 to 5" });
    }

    if (inputBody.hasOwnProperty("review")) {
      if (isValid(review) && typeof review == "string") {
        updates["review"] = review.trim();
      } else {
        return res
          .status(400)
          .send({ status: false, message: "Review is not valid" });
      }
    }
    //updating document

    const updatedReview = await ReviewModel.findByIdAndUpdate(inputReviewId, {$set: updates})
    const totalReviews = await ReviewModel.find({bookId: inputBookId}).lean()
    const bookData = await BookModel.findById(inputBookId).lean()

    //Adding reviews property to book data 
    bookData.reviews = totalReviews

    res.status(200).send({status: false, message: 'Review updated successfully', data: bookData})

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};




const deleteReview = async function (req, res) {
  try {
    const inputBody = req.body;
    const inputBookId = req.params.bookId;
    const inputReviewId = req.params.reviewId;

    if (Object.keys(inputBody).length !== 0) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid request" });
    }

    if (!isValidIdType(inputBookId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid book Id" });
    }

    const bookByBookId = await BookModel.findOne({
      _id: inputBookId,
      isDeleted: false,
      deletedAt: null
    });

    if (!bookByBookId) {
      return res
        .status(400)
        .send({ status: false, message: `No review found by ${inputBookId}` });
    }

    if(!isValidIdType(inputReviewId)){
      return res.status(400).send({status:false, message: 'Invalid review id'})
    }

    const reviewByReviewId = await ReviewModel.findOne({_id: inputReviewId, isDeleted: false});

    if (!reviewByReviewId) {
      return res
        .status(400)
        .send({
          status: false,
          message: `No review found by ${inputReviewId}`,
        });
    }


    const deletedReview = await ReviewModel.findByIdAndUpdate(
      inputReviewId,
      {
        $set: {
          isDeleted: true
        },
      },
      { new: true }
    );

    res
      .status(200)
      .send({ status: true, message: "Review deleted successfully" });

  
    } catch (err) {
    res.status(500).send({ error: err.message });
  }
};



module.exports.createBookReview = createBookReview;
module.exports.updateReview = updateReview;
module.exports.deleteReview = deleteReview;
