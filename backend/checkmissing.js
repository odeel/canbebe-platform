const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    fullName: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    birthWeight: {
        value: Number,
        unit: {
            type: String,
            enum: ['kg', 'lbs'],
            default: 'kg'
        }
    },
    birthLength: {
        value: Number,
        unit: {
            type: String,
            enum: ['cm', 'inches'],
            default: 'cm'
        }
    },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
    },
    profilePhoto: {
        type: String
    },
    medicalConditions: [{
        condition: String,
        diagnosedDate: Date,
        severity: {
            type: String,
            enum: ['Mild', 'Moderate', 'Severe']
        },
        notes: String
    }],
    allergies: [{
        allergen: String,
        severity: {
            type: String,
            enum: ['Mild', 'Moderate', 'Severe', 'Life-threatening']
        },
        reaction: String,
        diagnosedDate: Date
    }],
    medications: [{
        name: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
        prescribedBy: String,
        reason: String
    }],
    pediatrician: {
        name: String,
        clinic: String,
        phone: String,
        email: String
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
        alternatePhone: String
    },
    notes: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
childSchema.index({ user: 1, isActive: 1 });
childSchema.index({ dateOfBirth: 1 });

// Virtual for age in months
childSchema.virtual('ageInMonths').get(function () {
    const now = new Date();
    const birth = new Date(this.dateOfBirth);
    const months = (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth());
    return months;
});

// Virtual for age in days
childSchema.virtual('ageInDays').get(function () {
    const now = new Date();
    const birth = new Date(this.dateOfBirth);
    const diff = now - birth;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Virtual for formatted age
childSchema.virtual('ageFormatted').get(function () {
    const months = this.ageInMonths;
    if (months < 12) {
        return `${months} month${months !== 1 ? 's' : ''}`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
});

// Pre-save middleware to set fullName
childSchema.pre('save', function (next) {
    if (this.firstName) {
        this.fullName = this.lastName
            ? `${this.firstName} ${this.lastName}`
            : this.firstName;
    }
    next();
});

// Static method to get children by user
childSchema.statics.getByUser = function (userId) {
    return this.find({ user: userId, isActive: true }).sort({ dateOfBirth: 1 });
};

// Static method to get active children count for user
childSchema.statics.getActiveCount = function (userId) {
    return this.countDocuments({ user: userId, isActive: true });
};

// Instance method to add medical condition
childSchema.methods.addMedicalCondition = function (condition) {
    this.medicalConditions.push(condition);
    return this.save();
};

// Instance method to add allergy
childSchema.methods.addAllergy = function (allergy) {
    this.allergies.push(allergy);
    return this.save();
};

// Instance method to add medication
childSchema.methods.addMedication = function (medication) {
    this.medications.push(medication);
    return this.save();
};

// Instance method to soft delete
childSchema.methods.softDelete = function () {
    this.isActive = false;
    return this.save();
};

// Ensure virtuals are included in JSON
childSchema.set('toJSON', { virtuals: true });
childSchema.set('toObject', { virtuals: true });

// Prevent OverwriteModelError
module.exports = mongoose.models.Child || mongoose.model('Child', childSchema);