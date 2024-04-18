const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const Reseller = require("../models/Reseller");
const Supplier = require("../models/Supplier");

// exports.isAuthenticated = catchAsyncErrors(async(req,res,next) => {
//     try {
//         const {token} = req.cookies;

//         if(!token){
//             return next(new ErrorHandler("Please login to continue", 401));
//         }

//         const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//         req.reseller = await Reseller.findById(decoded.id);

//         next();
//     } catch (error) {
//         res.status(401).json({message: error.message})
//     }
// });

function auth(req, res, next) {
    try {
        const token = req.cookies.token;
        if(!token) {
            return res.status(401).json({message: "Unauthorized"});
        }

        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.reseller = verified.reseller;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({message: error.message})
    }
}

module.exports = auth;


// exports.isSeller = catchAsyncErrors(async(req,res,next) => {
//     const {seller_token} = req.cookies;
//     if(!seller_token){
//         return next(new ErrorHandler("Please login to continue", 401));
//     }

//     const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

//     req.seller = await Supplier.findById(decoded.id);

//     next();
// });


// exports.isAdmin = (...roles) => {
//     return (req,res,next) => {
//         if(!roles.includes(req.user.role)){
//             return next(new ErrorHandler(`${req.user.role} can not access this resources!`))
//         };
//         next();
//     }
// }