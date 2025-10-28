const mongoose = require('mongoose');

const districtDataSchema = new mongoose.Schema({
  districtCode: {
    type: String,
    required: true,
    unique: true
  },
  districtName: {
    type: String,
    required: true
  },
  districtNameHindi: {
    type: String,
    default: ''
  },
  stateCode: {
    type: String,
    required: true
  },
  stateName: {
    type: String,
    required: true
  },
  totalJobCards: {
    type: Number,
    default: 0
  },
  activeJobCards: {
    type: Number,
    default: 0
  },
  totalWorkers: {
    type: Number,
    default: 0
  },
  workersProvided: {
    type: Number,
    default: 0
  },
  personDaysGenerated: {
    type: Number,
    default: 0
  },
  averageDaysPerHousehold: {
    type: Number,
    default: 0
  },
  totalExpenditure: {
    type: Number,
    default: 0
  },
  wagePayment: {
    type: Number,
    default: 0
  },
  materialPayment: {
    type: Number,
    default: 0
  },
  completedWorks: {
    type: Number,
    default: 0
  },
  ongoingWorks: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  dataSource: {
    type: String,
    enum: ['api', 'manual', 'cached'],
    default: 'cached'
  },
  financialYear: {
    type: String,
    default: '2024-25'
  }
}, {
  timestamps: true
});

districtDataSchema.index({ stateCode: 1, districtCode: 1 });
districtDataSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('DistrictData', districtDataSchema);