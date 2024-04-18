const Supplier = require('../models/Supplier')
const Product = require('../models/Reseller')
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sendMail = require('../middleware/sendMail');
const fs = require('fs');
const path = require('path');
const sendSupplierToken = require('../utils/supplierToken');

// @desc get all resellers
// @route GET /resellers
// @access Private
const getAllSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find().lean()
    if(!suppliers?.length) {
        return res.status(400).json({message: 'No suppliers found'})
    }
    res.json(suppliers)
})

// @desc create new reseller
// @route POST /resellers
// @access Private
const createNewSupplier = asyncHandler(async (req, res) => {

try {
    const { firstName, lastName, companyName, companyEmail, companyType, categories, location, email, address, dollarExchangeRate, phoneNumber, password } = req.body;

    if(!firstName || !lastName || !location || !email || !companyName || !companyEmail || !categories || !companyType || !dollarExchangeRate || !address || !phoneNumber || !password) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check if the email already exists
    const Email = await Supplier.findOne({ companyEmail });
    if (Email) {
        return res.status(409).json({ message: 'Supplier already exists!' })
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    // Create a new user with status 'Not Approved'
    const newSupplier = new Supplier({
        firstName, 
        lastName, 
        companyName, 
        companyEmail, 
        companyType, 
        categories, 
        location, 
        email, 
        address, 
        dollarExchangeRate, 
        phoneNumber, 
        "password": hashedPwd,
        status: "Not approved",
        roles: "Supplier"
    });

    // Save the user to the database
    await newSupplier.save();

    const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
        .replace('{{firstName}}', newSupplier.firstName)
        .replace('{{message}}', `Hi ${newSupplier.firstName}, an account has been created successfully. Kindly login using these credentials: `);

    // Send an email with the formatted template
    await sendMail({
        email: newSupplier.email,
        subject: "Account Created",
        html: formattedTemplate,
    });

    // // // Send an email to the user
    // await sendMail({
    //   email: newReseller.email,
    //   subject: "Application Received",
    //   message: `Hi ${newReseller.firstName}, we have received your application to become a member of our platform. Your account is pending approval from our team. Kindly be patient as we process your application. You will be notified upon approval.`,
    // });

    res.status(201).json({
      success: true,
      message: `Please check your personal email (${newSupplier.email}) for further instructions.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred!'})
  }
});
const registerNewSupplier = asyncHandler(async (req, res) => {

try {
    const { firstName, lastName, companyName, companyEmail, companyType, categories, country, email, address, dollarExchangeRate, phoneNumber, password } = req.body;

    if(!firstName || !lastName || !country || !email || !companyName || !companyEmail || !categories || !companyType || !dollarExchangeRate || !address || !phoneNumber || !password) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check if the email already exists
    const Email = await Supplier.findOne({ companyEmail });
    if (Email) {
        return res.status(409).json({ message: 'Supplier already exists!' })
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    // Create a new user with status 'Not Approved'
    const newSupplier = new Supplier({
        firstName, 
        lastName, 
        companyName, 
        companyEmail, 
        companyType, 
        categories, 
        country, 
        email, 
        address, 
        dollarExchangeRate, 
        phoneNumber, 
        "password": hashedPwd,
        status: "Not approved",
        roles: "Supplier"
    });

    // Save the user to the database
    await newSupplier.save();

    const emailTemplatePath = path.join(__dirname, '..', 'views', 'emailTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
        .replace('{{firstName}}', newSupplier.firstName)
        .replace('{{message}}', `Hi ${newSupplier.firstName}, we have received your application to become a member of our platform. Your account is pending approval from our team. Kindly be patient as we process your application. You will be notified upon approval.`);

    // Send an email with the formatted template
    await sendMail({
        email: newSupplier.email,
        subject: "Application Received",
        html: formattedTemplate,
    });

    res.status(201).json({
      success: true,
      message: `Please check your personal email (${newSupplier.email}) for further instructions.`,
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

const loginSupplier = asyncHandler(async (req, res) => {
    try {
        const { companyEmail, password } = req.body;

        if (!companyEmail || !password) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        const supplier = await Supplier.findOne({ companyEmail }).select("+password");

        if (!supplier) {
            return res.status(400).json({ message: 'Reseller does not exist!' });
        }

        if (supplier.status !== "Approved") {
            return res.status(401).json({ message: 'Your account is pending approval. You are not allowed to sign in!' });
        }

        const isPasswordValid = await bcrypt.compare(password, supplier.password)

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid details. Try again!' });
        }
        sendSupplierToken(supplier, 201, res);
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

const getSupplierById = asyncHandler(async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if(!supplier) {
            return res.status(404).json({ message: 'Supplier not found!' });
        }
      res.status(201).json({
        success: true,
        supplier,
      });
      } catch (error) {
        return res.status(500).json(error.message);
      }
})


const updateSupplier = asyncHandler(async (req, res) => {
    const {id, firstName, lastName, companyName, companyEmail, companyType, categories, country, email, address, dollarExchangeRate, phoneNumber, password, roles, status, active } = req.body;

    // confirm data
    if(!id || !firstName || !lastName || !companyName || !companyEmail || !companyType || !categories.length || !country || !email || !address || !dollarExchangeRate || !phoneNumber) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const supplier = await Supplier.findById(id).exec()

    if(!supplier) {
        return res.status(400).json({ message: 'Supplier not found' })
    }

    // check for duplicate
    const duplicate = await Supplier.findOne({ companyName }).lean().exec()

    // Allow updates to the original user
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate Company Name' })
    }

    supplier.firstName = firstName
    supplier.lastName = lastName
    supplier.companyName = companyName
    supplier.companyEmail = companyEmail
    supplier.companyType = companyType
    supplier.categories = categories
    supplier.country = country
    supplier.email = email
    supplier.address = address
    supplier.dollarExchangeRate = dollarExchangeRate
    supplier.phoneNumber = phoneNumber
    supplier.active = active
    supplier.status = status
    supplier.roles = roles

    if(password) {
        // hash password
        supplier.password = await bcrypt.hash(password, 10);
    }

    const updatedSupplier = await supplier.save();

    res.json({ message: `${updatedSupplier.username} updated` })
})

// @desc delete a reseller
// @route DELETE /resellers
// @access Private
const deleteSupplier = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if(!id) {
        return res.status(400).json({ message: "Supplier ID Required!" })
    }

    const supplier = await Supplier.findById(id).exec()
    
    if(!supplier) {
        return res.status(400).json({ message: 'Supplier not found' })
    }

    const result = await supplier.deleteOne()

    const reply = `Supplier ${supplier.firstName} with ID ${supplier._id} deleted.`

    res.json(reply)
})

const approveSupplier = asyncHandler(async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
          return res.status(404).json({ message: "Supplier not found" });
        }
  
        const approvedSupplier = await Supplier.findByIdAndUpdate(req.params.id, { status: "Approved" }, { new: true });;
              // Send account approval email
              const approvalEmailOptions = {
                  email: approvedSupplier.email,
                  subject: "Account Approval Notification",
                  html: `<p>Dear ${approvedSupplier.name},</p>
                         <p>We are pleased to inform you that your seller account has been approved! You can now log in to your account and start using our platform.</p>
                         <p>Thank you for joining us.</p>
                         <p>Best regards,<br>Reseller Sprint Team</p>`
              };
  
              await sendMail(approvalEmailOptions);
  
        res.status(200).json({ message: "Supplier approved", seller: approvedSupplier });
      } catch (error) {
        // console.error(error);
        res.status(500).json(error.message);
      }
})

module.exports = {
    getAllSuppliers, 
    createNewSupplier, 
    registerNewSupplier, 
    updateSupplier,
    loginSupplier,
    getSupplierById,
    deleteSupplier,
    approveSupplier
}