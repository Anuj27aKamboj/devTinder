const validator = require("validator");

const validateSignUpData = (req)=>{
    const {firstName, lastName, emailId, password} = req.body;

    if(!firstName){
        throw new Error("Name is invalid")
    }else if(!validator.isEmail(emailId)){
        throw new Error("Invalid Credentials")
    }else if(!validator.isStrongPassword(password)){
        throw new Error("Please enter a strong password")
    }
};

const validateLogInData = (req)=>{
    const {emailId, password} = req.body;

    if(!validator.isEmail(emailId)){
        throw new Error("Invalid Credentials")
    }else if(!validator.isStrongPassword(password)){
        throw new Error("Please enter a strong password")
    }
}

const validateProfileData = (req)=>{
    const allowedEditFields = ["firstName", "lastName", "age", "gender", "photoURL", "about", "skills"];
    const isAllowedUpates = Object.keys(req.body).every(field => allowedEditFields.includes(field));
    return isAllowedUpates;
}

module.exports = {
    validateSignUpData,
    validateLogInData,
    validateProfileData,
}