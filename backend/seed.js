const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const testPassword = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/canbebe");
        console.log("✅ Connected to MongoDB");

        // Delete all users
        await User.deleteMany({});
        console.log("✅ Deleted all users");

        // Create an admin user - password will be hashed by pre-save hook
        const adminUser = await User.create({
            firstName: "Admin",
            lastName: "User",
            email: "admin@canbeb.com",
            password: "Admin123!", // Plain text - pre-save hook will hash it
            role: "admin",
        });

        console.log("✅ Admin user created");
        console.log("Email:", adminUser.email);
        console.log("Password (plain):", "Admin123!");
        console.log("Role:", adminUser.role);

        // Now try to login
        const user = await User.findOne({ email: "admin@canbebe.com" }).select("+password");

        console.log("\n--- LOGIN TEST ---");
        console.log("User found:", !!user);
        console.log("Stored password hash:", user.password);

        // Test password comparison
        const isMatch = await bcrypt.compare("Admin123!", user.password);
        console.log("Password match:", isMatch);

        if (isMatch) {
            console.log("\n✅ SUCCESS! Password hashing is working correctly!");
            console.log("\n🔐 Admin Login Credentials:");
            console.log("Email: admin@canbebe.com");
            console.log("Password: Admin123!");
            console.log("Role: admin");
        } else {
            console.log("\n❌ FAILED! Password comparison failed");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

testPassword();