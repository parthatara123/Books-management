const BookModel = require("../model/bookModel");
const UserModel = require("../model/userModel");
const isbn = require("node-isbn");
const mongoose = require("mongoose");
const moment = require("moment");
const ReviewModel = require("../model/reviewModel");

//validation function for required properties
const isValid = function (value) {
  if (typeof value == "undefined" || typeof value == null) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  return true;
};

//Validation of id
const isValidIdType = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

//Route handler function to create new book
const createBook = async function (req, res) {
  try {
    //various inputs
    const inputBody = req.body;
    const inputQuery = req.query;
    const validateToken = req["validateToken"];

    //Request must not come from query params
    if (Object.keys(inputQuery).length !== 0) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid Endpoint" });
    }

    //There must be input book data in request body
    if (Object.keys(inputBody).length === 0) {
      return res.status(400).send({
        status: false,
        message: "Please provide user data in request body",
      });
    }

    //Assignment of variables
    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } =
      inputBody;

    //Validation of required properties
    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Book title is required" });
    }

    if (!isValid(excerpt)) {
      return res
        .status(400)
        .send({ status: false, message: "Book excerpt is required" });
    }

    if (!isValid(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "User user Id is required" });
    }

    if (!isValidIdType(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid user Id" });
    }

    if (validateToken.userId != userId) {
      return res
        .status(403)
        .send({ status: false, message: "Unauthorized excess" });
    }

    if (Date.now > validateToken.exp * 1000) {
      return res.status(403).send({ status: false, message: "Token expired" });
    }

    if (!isValid(ISBN)) {
      return res
        .status(400)
        .send({ status: false, message: "Book ISBN is required" });
    }

    if (!isValid(category)) {
      return res
        .status(400)
        .send({ status: false, message: "Book category is required" });
    }

    if (!isValid(subcategory)) {
      return res
        .status(400)
        .send({ status: false, message: "Book subcategory is required" });
    }

    // Check if provided date is in YYYY-MM-DD format or not
    if (!/^[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}/.test(releasedAt)) {
      return res.status(400).send({
        status: false,
        message: `released date format should be YYYY-MM-DD`,
      });
    }

    // check date validation by moment
    if (moment(releasedAt).isValid == false) {
      return res.status(400).send({
        status: false,
        message: `Released date is invalid`,
      });
    }

    //Check if userId is available or not
    const userByUserId = await UserModel.findById(userId);

    if (!userByUserId) {
      return res
        .status(404)
        .send({ status: false, message: "No such user exist" });
    }

    //Check if title is unique ot not
    const bookByTitle = await BookModel.findOne({
      title: title,
      isDeleted: false,
    });

    if (bookByTitle) {
      return res
        .status(400)
        .send({ status: false, message: "Book title is already exists" });
    }

    //Check if ISBN is unique ot not
    const bookByISBN = await BookModel.findOne({
      ISBN: ISBN,
      isDeleted: false,
      deletedAt: null,
    });

    if (bookByISBN) {
      return res
        .status(400)
        .send({ status: false, message: "ISBN is already exists" });
    }

    //isDeleted must be false while creating book
    inputBody.isDeleted = false;
    //Number of reviews must be 0 while creating book
    inputBody.reviews = 0;

    // Create book mongoose query
    const createdBook = await BookModel.create(inputBody);

    res.status(201).send({
      status: true,
      message: "Book created successfully",
      data: createdBook,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};







//Route handler function to get book list
const getBookByFilteredData = async function (req, res) {
  try {
    const inputBody = req.body;
    const inputQuery = req.query;

    //check if Input book data is through request body or not
    if (Object.keys(inputBody).length !== 0) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid request" });
    }

    //Default filter value is no filter is given by query params
    const filteredData = { isDeleted: false };

    // Checking if filter data is provided in input query
    if (Object.keys(inputQuery).length !== 0) {
      const { userId, category, subcategory } = inputQuery;

      //Checking various property provided in input query params
      if (inputQuery.hasOwnProperty("userId")) {
        if (!isValidIdType(userId)) {
          return res
            .status(400)
            .send({ status: false, message: "Invalid user Id" });
        }
        //if userId is provided, it shall be added to filteredData
        filteredData["userId"] = inputQuery.userId;
      }

      if (inputQuery.hasOwnProperty("category")) {
        if (!isValid(category)) {
          return res
            .status(400)
            .send({
              status: false,
              message: "User category value is required",
            });
        }
        //if category is provided, it shall be added to filteredData
        filteredData["category"] = inputQuery.category;
      }

      if (inputQuery.hasOwnProperty("subcategory")) {
        if (!isValid(subcategory)) {
          return res.status(400).send({
            status: false,
            message: "User subcategory value is required",
          });
        }
        //if subcategory is provided, it shall be added to filteredData
        filteredData["subcategory"] = inputQuery.subcategory;
      }

      //finding books by given filter data and selecting required properties
      const filteredBooks = await BookModel.find(filteredData)
        .select({
          title: 1,
          excerpt: 1,
          userId: 1,
          category: 1,
          reviews: 1,
          releasedAt: 1,
        })
        .sort({ title: 1 }); // sorting it by title

      res
        .status(200)
        .send({ status: true, message: "Books list", data: filteredBooks });

      // if no filter data is provided
    } else {
      const filteredBooks = await BookModel.find(filteredData)
        .select({
          title: 1,
          excerpt: 1,
          userId: 1,
          category: 1,
          reviews: 1,
          releasedAt: 1,
        })
        .sort({ title: 1 });

      res
        .status(200)
        .send({ status: true, message: "Books list", data: filteredBooks });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};









//Router handler function to get book by id
const getBookById = async function (req, res) {
  try {
    inputBody = req.body;
    inputBookId = req.params.bookId;

    //Checking if request is coming from body
    if (Object.keys(inputBody).length !== 0) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid request" });
    }

    //check input book id provided in path params is valid or not
    if (!isValidIdType(inputBookId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid book Id" });
    }

    //Get book by given id in path params
    const bookByBookId = await BookModel.findOne({
      _id: inputBookId,
      isDeleted: false,
      deletedAt: null,
    }).lean();

    //if no book is available by given id
    if (!bookByBookId) {
      return res
        .status(400)
        .send({ status: false, message: "No book exists by given id" });
    }

    //find all reviews of given book
    const reviews = await ReviewModel.find({
      bookId: inputBookId,
      isDeleted: false,
    }).lean();

    //adding reviews property to book data

    bookByBookId["reviewsData"] = reviews;

    res
      .status(200)
      .send({ status: true, message: "Books list", data: bookByBookId });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};










//Route handler function to update book
const updateBook = async function (req, res) {
  try {
    //Checking if request is coming from body
    const inputBody = req.body;
    const inputBookId = req.params.bookId;

    if (Object.keys(inputBody).length === 0) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid request" });
    }

    //Assigning various properties which are requested to update
    const { title, excerpt, releasedAt, ISBN } = inputBody;
    const updates = {};

    if (inputBody.hasOwnProperty("title")) {
      if (isValid(title) && typeof title == "string") {
        const booKByTitle = await BookModel.findOne({
          title: title.trim(),
          isDeleted: false,
          deletedAt: null,
        });
        if (booKByTitle) {
          return res
            .status(400)
            .send({ status: false, message: "Book title is already exists" });
        }
      } else {
        return res
          .status(400)
          .send({ status: false, message: "Enter a valid book title" });
      }
      updates["title"] = title.trim();
    }

    if (inputBody.hasOwnProperty("excerpt")) {
      if (isValid(excerpt) && typeof excerpt == "string") {
        updates["excerpt"] = excerpt.trim();
      } else {
        return res
          .status(400)
          .send({ status: false, message: "Book excerpt is not valid" });
      }
    }
    if (inputBody.hasOwnProperty("releasedAt")) {
      if (!/^[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}/.test(releasedAt)) {
        return res.status(400).send({
          status: false,
          message: `released date format should be YYYY-MM-DD`,
        });
      }

      // check date validation by moment
      if (moment(releasedAt).isValid() == false) {
        return res.status(400).send({
          status: false,
          message: `Released date is invalid`,
        });
      }
      updates["releasedAt"] = releasedAt;
    }

    if (inputBody.hasOwnProperty("ISBN")) {
      if (isValid(ISBN) && typeof ISBN == "string") {
        const booKByISBN = await BookModel.findOne({
          ISBN: ISBN.trim(),
          isDeleted: false,
          deletedAt: null,
        });

        if (booKByISBN) {
          return res
            .status(400)
            .send({ status: false, message: "Book ISBN is already exists" });
        } else {
          return res
            .status(400)
            .send({ status: false, message: "Book ISBN is invalid" });
        }
      }
      updates["ISBN"] = ISBN.trim();
    }

    const updatedBook = await BookModel.findOneAndUpdate(
      { _id: inputBookId, isDeleted: false, deletedAt: null },
      { $set: updates },
      { new: true }
    );

    res.status(200).send({
      status: true,
      message: "Book data updated successfully",
      data: updatedBook,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};






const deletedBook = async function (req, res) {
  try {
    inputBody = req.body;
    inputBookId = req.params.bookId;

    if (Object.keys(inputBody).length !== 0) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid request" });
    }

    const deletedBook = await BookModel.findByIdAndUpdate(
      inputBookId,
      {
        $set: {
          isDeleted: true,
          deletedAt: moment().format("YYYY-MM-DD, h:mm:ss a"),
        },
      },
      { new: true }
    );

    res
      .status(200)
      .send({ status: true, message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
module.exports.createBook = createBook;
module.exports.getBookByFilteredData = getBookByFilteredData;
module.exports.getBookById = getBookById;
module.exports.updateBook = updateBook;
module.exports.deletedBook = deletedBook;
