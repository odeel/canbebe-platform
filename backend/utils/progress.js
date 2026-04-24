/**
 * Progress Calculation Utilities
 * Used for tracking vaccination progress and milestones
 */

/**
 * Calculate vaccination progress percentage
 * @param {number} completed - Number of completed vaccinations
 * @param {number} total - Total number of vaccinations
 * @returns {number} Progress percentage (0-100)
 */
const calculateProgress = (completed, total) => {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((completed / total) * 100), 100);
};

/**
 * Calculate overall vaccination progress for a child
 * @param {Array} vaccinations - Array of vaccination records
 * @returns {Object} Progress statistics
 */
const calculateVaccinationProgress = (vaccinations) => {
  if (!vaccinations || vaccinations.length === 0) {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      progress: 0
    };
  }

  const now = new Date();
  let completed = 0;
  let pending = 0;
  let overdue = 0;

  vaccinations.forEach(vaccination => {
    if (vaccination.status === 'completed' || vaccination.administered) {
      completed++;
    } else if (vaccination.dueDate && new Date(vaccination.dueDate) < now) {
      overdue++;
    } else {
      pending++;
    }
  });

  return {
    total: vaccinations.length,
    completed,
    pending,
    overdue,
    progress: calculateProgress(completed, vaccinations.length)
  };
};

/**
 * Get vaccination status based on due date
 * @param {Date} dueDate - Due date for the vaccination
 * @param {boolean} administered - Whether vaccination was administered
 * @returns {string} Status: 'completed', 'overdue', 'upcoming', or 'pending'
 */
const getVaccinationStatus = (dueDate, administered = false) => {
  if (administered) return 'completed';
  
  if (!dueDate) return 'pending';
  
  const now = new Date();
  const due = new Date(dueDate);
  
  if (due < now) return 'overdue';
  
  const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue <= 7) return 'upcoming';
  
  return 'pending';
};

/**
 * Calculate age-based vaccination schedule progress
 * @param {Date} birthDate - Child's birth date
 * @param {Array} vaccinations - Array of vaccination records
 * @returns {Object} Age-based progress
 */
const calculateAgeBasedProgress = (birthDate, vaccinations) => {
  const ageInMonths = getAgeInMonths(birthDate);
  
  // Standard vaccination schedule milestones
  const milestones = [
    { age: 0, name: 'Birth', vaccines: ['BCG', 'HepB'] },
    { age: 2, name: '2 months', vaccines: ['DTP', 'Polio', 'HepB', 'Hib'] },
    { age: 4, name: '4 months', vaccines: ['DTP', 'Polio', 'Hib'] },
    { age: 6, name: '6 months', vaccines: ['DTP', 'Polio', 'HepB', 'Hib'] },
    { age: 12, name: '12 months', vaccines: ['MMR', 'Varicella'] },
    { age: 18, name: '18 months', vaccines: ['DTP', 'Polio'] }
  ];
  
  let currentMilestone = null;
  let nextMilestone = null;
  
  for (let i = 0; i < milestones.length; i++) {
    if (ageInMonths >= milestones[i].age) {
      currentMilestone = milestones[i];
    } else {
      nextMilestone = milestones[i];
      break;
    }
  }
  
  return {
    ageInMonths,
    currentMilestone,
    nextMilestone,
    overallProgress: calculateVaccinationProgress(vaccinations)
  };
};

/**
 * Get child's age in months
 * @param {Date} birthDate - Birth date
 * @returns {number} Age in months
 */
const getAgeInMonths = (birthDate) => {
  const birth = new Date(birthDate);
  const now = new Date();
  
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + 
                 (now.getMonth() - birth.getMonth());
  
  return months;
};

/**
 * Check if vaccination is due soon (within next 7 days)
 * @param {Date} dueDate - Due date for vaccination
 * @returns {boolean}
 */
const isDueSoon = (dueDate) => {
  if (!dueDate) return false;
  
  const now = new Date();
  const due = new Date(dueDate);
  const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  
  return daysUntilDue > 0 && daysUntilDue <= 7;
};

/**
 * Get next vaccination due
 * @param {Array} vaccinations - Array of vaccination records
 * @returns {Object|null} Next vaccination or null
 */
const getNextVaccination = (vaccinations) => {
  if (!vaccinations || vaccinations.length === 0) return null;
  
  const pending = vaccinations.filter(v => 
    !v.administered && v.dueDate && new Date(v.dueDate) >= new Date()
  );
  
  if (pending.length === 0) return null;
  
  pending.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  return pending[0];
};

/**
 * Get overdue vaccinations
 * @param {Array} vaccinations - Array of vaccination records
 * @returns {Array} Overdue vaccinations
 */
const getOverdueVaccinations = (vaccinations) => {
  if (!vaccinations || vaccinations.length === 0) return [];
  
  const now = new Date();
  
  return vaccinations.filter(v => 
    !v.administered && v.dueDate && new Date(v.dueDate) < now
  );
};

module.exports = {
  calculateProgress,
  calculateVaccinationProgress,
  getVaccinationStatus,
  calculateAgeBasedProgress,
  getAgeInMonths,
  isDueSoon,
  getNextVaccination,
  getOverdueVaccinations
};