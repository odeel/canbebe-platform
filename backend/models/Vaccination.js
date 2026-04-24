const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vaccineName: {
    type: String,
    required: true,
    trim: true
  },
  vaccineType: {
    type: String,
    enum: [
      'BCG', 'HepB', 'DTP', 'DTaP', 'Polio', 'IPV', 'OPV',
      'Hib', 'PCV', 'Rotavirus', 'MMR', 'Varicella', 
      'HepA', 'Influenza', 'Meningococcal', 'HPV', 'Other'
    ],
    default: 'Other'
  },
  doseNumber: {
    type: Number,
    min: 1
  },
  totalDoses: {
    type: Number,
    min: 1
  },
  ageAtVaccination: {
    months: Number,
    days: Number
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  administeredDate: {
    type: Date
  },
  administered: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'upcoming', 'completed', 'overdue', 'missed', 'skipped'],
    default: 'pending'
  },
  location: {
    facilityName: String,
    address: String,
    city: String,
    country: String
  },
  administeredBy: {
    name: String,
    title: String,
    licenseNumber: String
  },
  batchNumber: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  lotNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  siteOfAdministration: {
    type: String,
    enum: ['Left arm', 'Right arm', 'Left thigh', 'Right thigh', 'Oral', 'Nasal', 'Other']
  },
  routeOfAdministration: {
    type: String,
    enum: ['Intramuscular', 'Subcutaneous', 'Intradermal', 'Oral', 'Nasal', 'Other']
  },
  reactions: [{
    type: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe']
    },
    description: String,
    startDate: Date,
    endDate: Date,
    treated: Boolean,
    treatment: String
  }],
  adverseEvents: [{
    eventType: String,
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe', 'Life-threatening']
    },
    description: String,
    reportedDate: Date,
    reportedTo: String,
    outcome: String
  }],
  notes: {
    type: String,
    trim: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderDate: {
    type: Date
  },
  certificate: {
    certificateNumber: String,
    issueDate: Date,
    issuedBy: String,
    fileUrl: String
  },
  nextDoseDate: {
    type: Date
  },
  isDelayed: {
    type: Boolean,
    default: false
  },
  delayReason: {
    type: String,
    trim: true
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'verified', 'pending'],
    default: 'unverified'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
vaccinationSchema.index({ child: 1, dueDate: 1 });
vaccinationSchema.index({ user: 1, status: 1 });
vaccinationSchema.index({ status: 1, dueDate: 1 });
vaccinationSchema.index({ administered: 1, dueDate: 1 });

// Virtual for checking if vaccination is overdue
vaccinationSchema.virtual('isOverdue').get(function() {
  if (this.administered) return false;
  return this.dueDate < new Date();
});

// Virtual for days until due
vaccinationSchema.virtual('daysUntilDue').get(function() {
  if (this.administered) return null;
  const now = new Date();
  const diff = this.dueDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for checking if due soon (within 7 days)
vaccinationSchema.virtual('isDueSoon').get(function() {
  if (this.administered) return false;
  const daysUntil = this.daysUntilDue;
  return daysUntil > 0 && daysUntil <= 7;
});

// Pre-save middleware to update status based on dates
vaccinationSchema.pre('save', function(next) {
  if (this.administered) {
    this.status = 'completed';
  } else if (this.dueDate < new Date()) {
    this.status = 'overdue';
  } else {
    const daysUntil = Math.ceil((this.dueDate - new Date()) / (1000 * 60 * 60 * 24));
    this.status = daysUntil <= 7 ? 'upcoming' : 'pending';
  }
  next();
});

// Method to mark as administered
vaccinationSchema.methods.markAsAdministered = function(data = {}) {
  this.administered = true;
  this.status = 'completed';
  this.administeredDate = data.administeredDate || new Date();
  
  if (data.location) this.location = data.location;
  if (data.administeredBy) this.administeredBy = data.administeredBy;
  if (data.batchNumber) this.batchNumber = data.batchNumber;
  if (data.manufacturer) this.manufacturer = data.manufacturer;
  if (data.lotNumber) this.lotNumber = data.lotNumber;
  if (data.siteOfAdministration) this.siteOfAdministration = data.siteOfAdministration;
  if (data.routeOfAdministration) this.routeOfAdministration = data.routeOfAdministration;
  if (data.notes) this.notes = data.notes;
  
  return this.save();
};

// Method to add reaction
vaccinationSchema.methods.addReaction = function(reaction) {
  this.reactions.push(reaction);
  return this.save();
};

// Method to add adverse event
vaccinationSchema.methods.addAdverseEvent = function(event) {
  this.adverseEvents.push(event);
  return this.save();
};

// Static method to get upcoming vaccinations for a child
vaccinationSchema.statics.getUpcoming = function(childId, days = 30) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    child: childId,
    administered: false,
    dueDate: { $gte: now, $lte: futureDate }
  }).sort({ dueDate: 1 });
};

// Static method to get overdue vaccinations for a child
vaccinationSchema.statics.getOverdue = function(childId) {
  return this.find({
    child: childId,
    administered: false,
    dueDate: { $lt: new Date() }
  }).sort({ dueDate: 1 });
};

// Static method to get vaccination history for a child
vaccinationSchema.statics.getHistory = function(childId) {
  return this.find({
    child: childId,
    administered: true
  }).sort({ administeredDate: -1 });
};

// Static method to get next vaccination for a child
vaccinationSchema.statics.getNext = function(childId) {
  return this.findOne({
    child: childId,
    administered: false,
    dueDate: { $gte: new Date() }
  }).sort({ dueDate: 1 });
};

// Ensure virtuals are included in JSON
vaccinationSchema.set('toJSON', { virtuals: true });
vaccinationSchema.set('toObject', { virtuals: true });

// Prevent OverwriteModelError by checking if model already exists
module.exports = mongoose.models.Vaccination || mongoose.model('Vaccination', vaccinationSchema);