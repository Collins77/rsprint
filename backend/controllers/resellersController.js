const Reseller = require('../models/Reseller')
const Product = require('../models/Reseller')
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sendMail = require('../middleware/sendMail');
const fs = require('fs');
const path = require('path');

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

    res.status(201).json({
      success: true,
      message: `Please check your email (${newReseller.email}) for further instructions.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred!'})
  }
});

const adminCreateReseller = asyncHandler(async (req, res) => {

  try {
      const { firstName, lastName, companyName, email, address, country, phoneNumber, password } = req.body;
  
      if(!firstName || !lastName || !email || !companyName || !address || !country || !phoneNumber || !password) {
          return res.status(400).json({message: 'All fields are required!'})
      }
  
      // Check if the email already exists
      const Email = await Reseller.findOne({ email });
      if (Email) {
          return res.status(409).json({ message: 'Reseller already exists!' })
      }
  
      // const hashedPwd = await bcrypt.hash(password, 10)
  
      // Create a new user with status 'Not Approved'
      const newReseller = new Reseller({
          firstName, 
          lastName, 
          companyName, 
          email, 
          address,  
          phoneNumber, 
          password,
          country,
          status: "Approved",
          roles: "Reseller"
      });
  
      // Save the user to the database
      await newReseller.save();
  
      const emailTemplatePath = path.join(__dirname, '..', 'views', 'accountSetup.html');
      const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');
  
      // Replace placeholders with actual values
      const formattedTemplate = emailTemplate
          .replace('{{firstName}}', newReseller.firstName)
          .replace('{{password}}', newReseller.password)
          .replace('{{email}}', newReseller.email)
  
      // Send an email with the formatted template
      await sendMail({
          email: newReseller.email,
          subject: "Application Received",
          html: formattedTemplate,
      });
  
      res.status(201).json({
        success: true,
        message: `Please check your personal email (${newReseller.email}) for further instructions.`,
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
      //validation
      if (!email || !password) {
        return res.status(400).send({
          success: false,
          message: "Invalid email or password",
        });
      }
      //check user
      const reseller = await Reseller.findOne({ email }).select("+password");
      if (!reseller) {
        return res.status(400).send({
          success: false,
          message: "Email is not registerd",
        });
      }

      if (reseller.status !== "Approved") {
          return res.status(401).json({ message: 'Your account is pending approval. You are not allowed to sign in!' });
      }
      const match = await bcrypt.compare(password, reseller.password)
      
      if (!match) {
        return res.status(400).send({
          success: false,
          message: "Invalid Password",
        });
      }
      //token
      const token = jwt.sign({ reseller: reseller._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({
        success: true,
        message: "login successfully",
        reseller,
        token,
      });
      
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Error in login",
        error,
      });
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

const getResellerById = asyncHandler(async (req, res) => {
  try {
      const reseller = await Reseller.findById(req.params.id);
      if(!reseller) {
          return res.status(404).json({ message: 'Reseller not found!' });
      }
    res.status(201).json({
      success: true,
      reseller,
    });
    } catch (error) {
      return res.status(500).json(error.message);
    }
})

const getNotApprovedResellers = asyncHandler(async (req, res) => {
  const resellers = await Reseller.find({ status: "Not approved" }).lean();
  if (!resellers?.length) {
      return res.status(400).json({ message: 'No resellers with status "Not approved" found' });
  }
  res.json(resellers);
});

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
    const { id } = req.params;
    updatedResellerData = req.body;
    try {
        // Validate input (you can use a validation library like Joi here)

        // Update the reseller in the database
        const updatedReseller = await Reseller.findByIdAndUpdate(id, updatedResellerData, { new: true });

        if (!updatedReseller) {
            return res.status(404).json({ error: 'Reseller not found' });
        }

        // Send a success response
        res.status(200).json({ message: 'Reseller updated successfully', reseller: updatedReseller });
    } catch (error) {
        console.error('Error updating reseller:', error);
        // Send an error response
        res.status(500).json({ error: 'Internal server error' });
    }

    // res.json({ message: `${updatedReseller.firstName} updated` })
})

const approveReseller = asyncHandler(async (req, res) => {
    try {
        const reseller = await Reseller.findById(req.params.id);
  
        if (!reseller) {
          return res.status(404).json({ message: "Reseller not found" });
        }
  
        reseller.status = "Approved";
        await reseller.save();

        const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
        const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

        // Replace placeholders with actual values
        const formattedTemplate = emailTemplate
            .replace('{{firstName}}', reseller.firstName)
            .replace('{{message}}', `Hi ${reseller.firstName}, we are pleased to inform you that your account has been approved! You can now log in to your account at https://resellerprint.com/login and start your journey with us.`);

        // Send an email with the formatted template
        await sendMail({
            email: reseller.email,
            subject: "Account Approval Notification",
            html: formattedTemplate,
        });
  
        res.status(200).json({
          success: true,
          message: "Reseller approved successfully!",
          reseller,
        });
      } catch (error) {
        return res.status(500).json(error.message);
      }
})

const holdReseller = asyncHandler(async (req, res) => {
  try {
      const reseller = await Reseller.findById(req.params.id);

      if (!reseller) {
        return res.status(404).json({ message: "Reseller not found" });
      }

      reseller.status = "On Hold";
      await reseller.save();

      const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
      const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

      // Replace placeholders with actual values
      const formattedTemplate = emailTemplate
          .replace('{{firstName}}', reseller.firstName)
          .replace('{{message}}', `Hi ${reseller.firstName}, we regret to inform you that your account has been put on hold! Kindly contact our team for further clarification.`);

      // Send an email with the formatted template
      await sendMail({
          email: reseller.email,
          subject: "Account Suspension Notification",
          html: formattedTemplate,
      });

      res.status(200).json({
        success: true,
        message: "Reseller suspended successfully!",
        reseller: reseller,
      });
    } catch (error) {
      return res.status(500).json(error.message);
    }
})
const rejectReseller = asyncHandler(async (req, res) => {
    try {
        const reseller = await Reseller.findById(req.params.id);
  
        if (!reseller) {
          return res.status(404).json({ message: "Reseller not found" });
        }
  
        reseller.status = "Rejected";
        await reseller.save();

        const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
        const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

        // Replace placeholders with actual values
        const formattedTemplate = emailTemplate
            .replace('{{firstName}}', reseller.firstName)
            .replace('{{message}}', `Hi ${reseller.firstName}, we regret to inform you that your application has been rejected! Kindly reach out to our team for further details.`);

        // Send an email with the formatted template
        await sendMail({
            email: reseller.email,
            subject: "Application Rejected",
            html: formattedTemplate,
        });
  
        res.status(200).json({
          success: true,
          message: "Reseller rejection successful!",
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

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await Reseller.findOne({email});
    if(!oldUser) {
      return res.status(400).json({ message: 'Reseller not found'});
    }
    //token
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "20m",
    });
    const link = `https://resprint.api.resellers/resellers/reset-password/${oldUser._id}/${token}`;
    const emailTemplatePath = path.join(__dirname, '..', 'views', 'forgotPassword.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
        .replace('{{firstName}}', oldUser.firstName)
        .replace('{{link}}', link)

    // Send an email with the formatted template
    await sendMail({
        email: oldUser.email,
        subject: "Password Reset",
        html: formattedTemplate,
    });
  } catch (error) {
    
  }
})

const resetPassword = asyncHandler(async (req, res) => {
  const {id, token} = req.params;
  const oldReseller = await Reseller.findOne({_id: id})
  if(!oldReseller) {
    return res.status(400).json({ message: "Reseller does not exist" });
  }
  try {
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.render('forgot', { email: verify.email, status:"not verified" })
  } catch (error) {
    res.send("Not verified")
  }

})
const resetPasswordComplete = asyncHandler(async (req, res) => {
  const {id, token} = req.params;
  const {password} = req.body;

  const oldReseller = await Reseller.findOne({_id: id})
  if(!oldReseller) {
    return res.status(400).json({ message: "Reseller does not exist" });
  }
  try {
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await Reseller.updateOne({
      id:id
    }, {
      $set: {
        password: encryptedPassword,
      },
    });
    res.render("forgot", {email: verify.email, status: "verified"})
  } catch (error) {
    res.json({status: "Something went wrong"})
  }

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
    loggedIn,
    forgotPassword,
    resetPassword,
    resetPasswordComplete,
    getNotApprovedResellers,
    rejectReseller,
    getResellerById,
    holdReseller,
    adminCreateReseller
}