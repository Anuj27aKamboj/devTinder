const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    minlength: [2, "First name must be at least 2 characters"],
    maxlength: [50, "First name cannot exceed 50 characters"],
    match: [/^[A-Za-z]+$/, "First name should contain only alphabets"]
  },

  lastName: {
    type: String,
    trim: true,
    minlength: [2, "Last name must be at least 2 characters"],
    maxlength: [50, "Last name cannot exceed 50 characters"],
    match: [/^[A-Za-z]+$/, "Last name should contain only alphabets"]
  },

  emailId: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    unique: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Please enter a valid email address"
    ]
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    maxlength: [100, "Password cannot exceed 100 characters"],
    validate(value) {
      const strongPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

      if (!strongPassword.test(value)) {
        throw new Error(
          "Password must contain uppercase, lowercase, number and special character"
        );
      }
    }
  },

  age: {
    type: Number,
    min: [18, "User must be at least 18 years old"],
    max: [120, "Age cannot exceed 120"]
  },

  gender: {
    type: String,
    enum: {
      values: ["male", "female", "others"],
      message: "{VALUE} is not a valid gender"
    }
  },

  photoURL: {
    type: String,
    default: "https://pixabay.com/vectors/blank-profile-picture-mystery-man-973460/",
    validate(value) {
      if (
        !/^https?:\/\/.+\..+/.test(value)
      ) {
        throw new Error("Photo must be a valid URL");
      }
    }
  },

  about: {
    type: String,
    trim: true,
    maxlength: [300, "About section cannot exceed 300 characters"],
    default: "This is default about"
  },

  skills: {
    type: [String],
    validate(value) {
      if (value.length > 10) {
        throw new Error("A user can have maximum 10 skills");
      }
    }
  }

},
{
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);