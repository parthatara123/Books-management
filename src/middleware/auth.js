const { TokenExpiredError } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const authentication = async function (req, res, next) {
  try {
    const token = req.headers["x-api-key"];
    const secretKey = "someonesprivatekeycontains123!@#";

    if (!token)
      return res
        .status(400)
        .send({ status: false, msg: "please provide token" });

    
    const validateToken = jwt.verify(token, secretKey);

    // jwt.verify(token, secretKey, (err, decodedToken) => {
    //   if(err.name === "TokenExpiredError"){
    //     const payload = jwt.verify(token, secretKey)
    //     const userId = payload.userId

    //     const refreshToken = jwt.sign({userId:userId}, secretKey)
    //     res.status(200).json({status:true, token: refreshToken})

    //   }else{
    //     res.status(401).send({status: false, msg: "invalid Token"})
    //   }

    // })

    req["authenticateToken"] = validateToken;

    if (!validateToken) {
      return res
        .status(401)
        .send({ status: false, msg: "authentication failed" });
    }

    if(Date.now() > validateToken.exp*1000){
        return res.status(403).send({status: false, message: 'Session expired, please login'})
    }
    
    next();
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};







const authorization = async function (req, res, next) {
  try {
    const id = req.params.bookId;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).send({status:false, message:'Invalid book id'})
    }

    const bookByBookId = await BookModel.findOne({_id: id, isDeleted: false, deletedAt: null});

    if (!bookByBookId){
      return res
        .status(404)
        .send({ status: false, msg: "no book available by given id"});
    }

    const validateToken = req["authenticateToken"] 

    if (validateToken.userId != bookByBookId.userId){
      return res
        .status(403)
        .send({ status: false, msg: "unauthorize access" });
    }
    
    if(Date.now() > validateToken.exp*1000){
        return res.status(403).send({status: false, message: 'Session expired, please login'})
    }
    next();

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports.authentication = authentication;
module.exports.authorization = authorization;
