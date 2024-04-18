const Reseller = require('../models/Reseller')
const Product = require('../models/Reseller')
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sendMail = require('../middleware/sendMail');
const fs = require('fs');
const path = require('path');
const sendToken = require('../utils/jwtToken');
const ErrorHandler = require('../utils/ErrorHandler');

// @desc get all resellers
// @route GET /resellers
// @access Private
const getAllResellers = asyncHandler(async (req, res) => {
    const resellers = await Reseller.find().lean()
    if(!resellers?.length) {
        return res.status(400).json({message: 'No resellers found'})
    }
    res.json(resellers)
})

// @desc create new reseller
// @route POST /resellers
// @access Private
const createNewReseller = asyncHandler(async (req, res) => {
//     const { name, email, shopName, password, address, phoneNumber, roles, status } = req.body;

//     // Confirming data
//     if(!name || !email || !shopName || !address || !phoneNumber || !password) {
//         return res.status(400).json({message: 'All fields are required!'})
//     }

//     // Check for duplicates
//     const duplicate = await Reseller.findOne({ shopName }).lean().exec()
//     if(duplicate) {
//         return res.status(409).json({ message: 'This Shop name has already been taken!' })
//     }

//     // Hash password
//     const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

//     const resellerObject = { name, email, shopName, password, address, phoneNumber,status, "password": hashedPwd, roles }

//     // Create and store new user
//     const reseller = await Reseller.create(resellerObject)

//     if(reseller) {
//         res.status(201).json({ message: `New reseller ${name} created` })
//     } else {
//         res.status(400).json({ message: 'Invalid user data received' })
//     }
// })
try {
    const { firstName, lastName, companyName, country, email, address, phoneNumber, password } = req.body;

    if(!firstName || !lastName || !country || !email || !companyName || !address || !phoneNumber || !password) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check if the email already exists
    const resellerEmail = await Reseller.findOne({ email });
    if (resellerEmail) {
        return res.status(409).json({ message: 'Reseller already exists!' })
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    // Create a new user with status 'Not Approved'
    const newReseller = new Reseller({
      firstName,
      lastName,
      email,
      country,
      companyName,
      address,
      phoneNumber,
      "password": hashedPwd,
      status: "Not approved",
      roles: "Reseller"
    });

    // Save the user to the database
    await newReseller.save();

    const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
        .replace('{{firstName}}', newReseller.firstName)
        .replace('{{message}}', `Hi ${newReseller.firstName}, we have received your application to become a member of our platform. Your account is pending approval from our team. Kindly be patient as we process your application. You will be notified upon approval.`);

    // Send an email with the formatted template
    await sendMail({
        email: newReseller.email,
        subject: "Application Received",
        html: formattedTemplate,
    });

    // // Send an email to the user
    // await sendMail({
    //   email: newReseller.email,
    //   subject: "Application Received",
    //   message: `Hi ${newReseller.firstName}, we have received your application to become a member of our platform. Your account is pending approval from our team. Kindly be patient as we process your application. You will be notified upon approval.`,
    // });

    res.status(201).json({
      success: true,
      message: `Please check your email (${newReseller.email}) for further instructions.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred!'})
  }
});

// const loginReseller = asyncHandler(async (req, res) => {
//     try {
//         const { email, password } = req.body;
  
//         if (!email || !password) {
//             return res.status(400).json({message: 'All fields are required!'})
//         }
  
//         const reseller = await Reseller.findOne({ email }).select("+password");
  
//         if (!reseller) {
//             return res.status(400).json({message: 'Reseller does not exist!'})
//         }
  
//         if (reseller.status !== "Approved") {
//         //   return next(new ErrorHandler("Your account is pending approval. You are not allowed to sign in.!", 401));
//           return res.status(401).json({message: 'Your account is pending approval. You are not allowed to sign in!'})

//         }
  
//         const isPasswordValid = await reseller.comparePassword(password);
  
//         if (!isPasswordValid) {
//             return res.status(400).json({message: 'Invalid details. Try again!'})

//         }
//         // sendToken(user, 201, res);
//         const accessToken = jwt.sign(
//             {
//                 "ResellerInfo": {
//                     "firstName": reseller.firstName,
//                     "roles": reseller.roles
//                 }
//             },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: '15m' }
//         )
    
//         const refreshToken = jwt.sign(
//             { "firstName": reseller.firstName },
//             process.env.REFRESH_TOKEN_SECRET,
//             { expiresIn: '7d' }
//         )
    
//         // Create secure cookie with refresh token 
//         res.cookie('jwt', refreshToken, {
//             httpOnly: true, //accessible only by web server 
//             secure: true, //https
//             sameSite: 'None', //cross-site cookie 
//             maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
//         })
    
//         // Send accessToken containing username and roles 
//         res.json({ accessToken })
//       } catch (error) {
//         // return next(new ErrorHandler(error.message, 500));
//         return res.status(500).json({message: "An error occurred while sending"})

//       }
// })

// @desc update a reseller
// @route PATCH /resellers
// @access Private

const loginReseller = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        const reseller = await Reseller.findOne({ email }).select("+password");

        if (!reseller) {
            return res.status(400).json({ message: 'Reseller does not exist!' });
        }

        if (reseller.status !== "Approved") {
            return res.status(401).json({ message: 'Your account is pending approval. You are not allowed to sign in!' });
        }

        const isPasswordValid = await bcrypt.compare(password, reseller.password)

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid details. Try again!' });
        }

        const token = jwt.sign({
          reseller: reseller._id, 
        },
        process.env.ACCESS_TOKEN_SECRET
        );
        res.cookie("token", token, {
          httpOnly: true, 
        }).send();
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

const getReseller = asyncHandler(async (req, res) => {
    try {
        const reseller = await Reseller.findById(req.reseller.id);
  
        if (!reseller) {
          return res.status(400).json({ message: "Reseller doesn't exist" });
        }
  
        res.status(200).json({
          success: true,
          reseller,
        });
      } catch (error) {
        return res.status(500).json(error.message);

      }
})

const loggedIn = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies.token;
    if(!token) {
      return res.json(false);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.send(true);
    next();
  } catch (error) {
    res.json(false)
  }
})

const logOutReseller = asyncHandler(async (req, res) => {
    try {
        res.cookie("token", null, {
          expires: new Date(Date.now()),
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        res.status(201).json({
          success: true,
          message: "Log out successful!",
        });
      } catch (error) {
        return res.status(500).json(error.message);
      }
})


const updateReseller = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body;

    // confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const reseller = await Reseller.findById(id).exec()

    if(!reseller) {
        return res.status(400).json({ message: 'Reseller not found' })
    }

    // check for duplicate
    const duplicate = await Reseller.findOne({ username }).lean().exec()

    // Allow updates to the original user
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    reseller.username = username
    reseller.roles = roles
    reseller.active = active

    if(password) {
        // hash password
        reseller.password = await bcrypt.hash(password, 10);
    }

    const updatedReseller = await reseller.save();

    res.json({ message: `${updatedReseller.username} updated` })
})

const approveReseller = asyncHandler(async (req, res) => {
    try {
        const reseller = await Reseller.findById(req.params.id);
  
        if (!reseller) {
          return res.status(404).json({ message: "Reseller not found" });
        }
  
        reseller.status = "Approved";
        await reseller.save();
  
        // Send account approval email
        const approvalEmailOptions = {
          email: reseller.email,
          subject: "Account Approval Notification",
          html: `<p>Dear ${reseller.firstName},</p>
                 <p>We are pleased to inform you that your account has been approved! You can now log in to your account and start using our platform.</p>
                 <p>Thank you for joining us.</p>
                 <p>Best regards,<br>Your Platform Team</p>`,
        };
  
        await sendMail(approvalEmailOptions);
  
        res.status(200).json({
          success: true,
          message: "Reseller approved successfully!",
          reseller,
        });
      } catch (error) {
        return res.status(500).json(error.message);
      }
})

// @desc delete a reseller
// @route DELETE /resellers
// @access Private
const deleteReseller = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if(!id) {
        return res.status(400).json({ message: "Reseller ID Required!" })
    }

    const reseller = await Reseller.findById(id).exec()
    
    if(!reseller) {
        return res.status(400).json({ message: 'Reseller not found' })
    }

    const result = await reseller.deleteOne()

    const reply = `Reseller ${reseller.firstName} with ID ${reseller._id} deleted.`

    res.json(reply)
})

module.exports = {
    getAllResellers, 
    createNewReseller, 
    updateReseller,
    loginReseller,
    getReseller,
    deleteReseller,
    logOutReseller,
    approveReseller,
    loggedIn
}