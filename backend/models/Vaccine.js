const mongoose = require('mongoose');

// ── Algerian national vaccination schedule ────────────────────────────────────
const DEFAULT_VACCINES = [
  { name: 'BCG',             dueAgeMonths: 0  },
  { name: 'Hepatite B',      dueAgeMonths: 0  },
  { name: 'DTP',             dueAgeMonths: 2  },
  { name: 'Polio (OPV)',     dueAgeMonths: 2  },
  { name: 'Hib',             dueAgeMonths: 2  },
  { name: 'Pneumococcique',  dueAgeMonths: 2  },
  { name: 'ROR',             dueAgeMonths: 9  },
  { name: 'Rappel rougeole', dueAgeMonths: 18 },
];

const vaccineItemSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    dueAgeMonths:  { type: Number, required: true, min: 0 },
    done:          { type: Boolean, default: false },
    doneDate:      { type: Date, default: null },
    // Nurse/doctor note attached to this dose
    notes:         { type: String, default: '' },
  },
  { _id: false } // sub-docs don't need their own _id
);

const vaccinationSchema = new mongoose.Schema(
  {
    babyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Baby',
      required: true,
      unique: true, // one vaccination record per baby — enforced at DB level
    },
    vaccines: {
      type: [vaccineItemSchema],
      default: () => DEFAULT_VACCINES.map((v) => ({ ...v })),
    },
  },
  { timestamps: true }
);

// ── Virtual: completion percentage ───────────────────────────────────────────
vaccinationSchema.virtual('progress').get(function () {
  if (!this.vaccines.length) return 0;
  const done = this.vaccines.filter((v) => v.done).length;
  return Math.round((done / this.vaccines.length) * 100);
});

// ── Helper: vaccines due for a given age in months ────────────────────────────
vaccinationSchema.methods.getDueVaccines = function (ageInMonths) {
  return this.vaccines.filter(
    (v) => !v.done && v.dueAgeMonths <= ageInMonths
  );
};

// ── Indexes ───────────────────────────────────────────────────────────────────
vaccinationSchema.index({ babyId: 1 }, { unique: true });

vaccinationSchema.set('toJSON', { virtuals: true });
vaccinationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);
module.exports.DEFAULT_VACCINES = DEFAULT_VACCINES;