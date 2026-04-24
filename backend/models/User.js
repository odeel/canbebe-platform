const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name too long"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name too long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["mother", "father", "grandmother", "babysitter", "pregnant", "admin"],
      default: "mother",
    },
    babies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Baby",
      },
    ],
    sharedBabies: [
      {
        babyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Baby",
          required: true,
        },
        permissions: {
          type: [String],
          enum: ["view", "edit", "log"],
          default: ["view"],
        },
        sharedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    language: {
      type: String,
      enum: ["fr", "ar", "en"],
      default: "en",
    },
    pushToken: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ FIXED virtual
userSchema.virtual("fullName").get(function () {
  return `${ this.firstName } ${ this.lastName }`;
});

// ❗️ REMOVE duplicate index (keep only unique: true above)
userSchema.index({ role: 1 });

// 🔐 Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 🧹 Clean output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);