const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const BookController = require("../controller/bookController");
const ReviewController = require("../controller/reviewController");
const Middleware = require('../middleware/auth')


//Test API
router.get("/test", Middleware.authentication, function (req, res) {
  res.send({ Status: true, msg: "Test API working" });
});

//Post API to create user
router.post("/register", UserController.registerUser);

//Post API for login
router.get("/login", UserController.userLogin);




//Post API to create book
router.post("/books", Middleware.authentication, Middleware.authorization, BookController.createBook);

//Post API to get filtered book
router.get("/books", Middleware.authentication, BookController.getBookByFilteredData);

//Get book data including reviews
router.get("/books/:bookId", BookController.getBookById);

//Put API to update book
router.put("/books/:bookId", Middleware.authentication, Middleware.authorization, BookController.updateBook);

//Delete API to delete book
router.delete("/books/:bookId", Middleware.authentication, Middleware.authorization, BookController.deletedBook);






//Post API to create review
router.post("/books/:bookId/review/:reviewId", ReviewController.createBookReview);

//Put API to update review
router.put('/books/:bookId/review/:reviewId', ReviewController.updateReview)

//Put API to delete review
router.delete('/books/:bookId/review/:reviewId', ReviewController.deleteReview)





module.exports = router;
