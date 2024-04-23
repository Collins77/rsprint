const Supplier = require('../models/Supplier')
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sendMail = require('../middleware/sendMail');
const fs = require('fs');
const path = require('path');
const sendSupplierToken = require('../utils/supplierToken');

const getAllSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find().lean()
    if(!suppliers?.length) {
        return res.status(400).json({message: 'No suppliers found'})
    }
    res.json(suppliers)
})


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

    res.status(201).json({
      success: true,
      message: `Please check your personal email (${newSupplier.email}) for further instructions.`,
    })
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

const adminCreateSupplier = asyncHandler(async (req, res) => {

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
        status: "Approved",
        roles: "Supplier"
    });

    // Save the user to the database
    await newSupplier.save();

    const emailTemplatePath = path.join(__dirname, '..', 'views', 'accountSetup.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Replace placeholders with actual values
    const formattedTemplate = emailTemplate
        .replace('{{firstName}}', newSupplier.firstName)
        .replace('{{password}}', newSupplier.password)
        .replace('{{email}}', newSupplier.email)

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

const loginSupplier = asyncHandler(async (req, res) => {
    
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
        const supplier = await Supplier.findOne({ email }).select("+password");
        if (!supplier) {
          return res.status(400).send({
            success: false,
            message: "Email is not registerd",
          });
        }
  
        if (supplier.status !== "Approved") {
            return res.status(401).json({ message: 'Your account is pending approval. You are not allowed to sign in!' });
        }
        const match = await bcrypt.compare(password, supplier.password)
        
        if (!match) {
          return res.status(400).send({
            success: false,
            message: "Invalid Password",
          });
        }
        //token
        const token = jwt.sign({ supplier: supplier._id }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "7d",
        });
        res.status(200).send({
          success: true,
          message: "login successfully",
          supplier,
          token,
        });
        
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: "Error in login",
          error,
        });
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

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    try {
      const oldSupplier = await Supplier.findOne({email});
      if(!oldSupplier) {
        return res.status(400).json({ message: 'Supplier not found'});
      }
      //token
      const token = jwt.sign({ email: oldSupplier.email, id: oldSupplier._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "20m",
      });
      const link = `http://localhost:3500/suppliers/reset-password/${oldSupplier._id}/${token}`;
      const emailTemplatePath = path.join(__dirname, '..', 'views', 'forgotPassword.html');
      const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');
  
      // Replace placeholders with actual values
      const formattedTemplate = emailTemplate
          .replace('{{firstName}}', oldSupplier.firstName)
          .replace('{{link}}', link)
  
      // Send an email with the formatted template
      await sendMail({
          email: oldSupplier.email,
          subject: "Password Reset",
          html: formattedTemplate,
      });
    } catch (error) {
      
    }
  })
  
  const resetPassword = asyncHandler(async (req, res) => {
    const {id, token} = req.params;
    const oldSupplier = await Supplier.findOne({_id: id})
    if(!oldSupplier) {
      return res.status(400).json({ message: "Supplier does not exist" });
    }
    try {
      const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.render('supplierForgot', { email: verify.email, status:"not verified" })
    } catch (error) {
      res.send("Not verified")
    }
  
  })
  const resetPasswordComplete = asyncHandler(async (req, res) => {
    const {id, token} = req.params;
    const {password} = req.body;
  
    const oldSupplier = await Supplier.findOne({_id: id})
    if(!oldSupplier) {
      return res.status(400).json({ message: "Supplier does not exist" });
    }
    try {
      const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const encryptedPassword = await bcrypt.hash(password, 10);
      await Supplier.updateOne({
        id:id
      }, {
        $set: {
          password: encryptedPassword,
        },
      });
      res.render("supplierForgot", {email: verify.email, status: "verified"})
    } catch (error) {
      res.json({status: "Something went wrong"})
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
    approveSupplier, 
    forgotPassword, 
    resetPassword,
    resetPasswordComplete
}