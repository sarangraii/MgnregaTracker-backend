const express = require('express');
const router = express.Router();
const DistrictData = require('../models/DistrictData');

router.get('/districts', async (req, res) => {
  try {
    const districts = await DistrictData.find({ stateCode: '09' })
      .select('districtCode districtName districtNameHindi personDaysGenerated totalExpenditure averageDaysPerHousehold lastUpdated')
      .sort({ districtName: 1 });
    
    res.json({
      success: true,
      count: districts.length,
      data: districts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch districts',
      message: error.message
    });
  }
});

router.get('/districts/:districtCode', async (req, res) => {
  try {
    const district = await DistrictData.findOne({ 
      districtCode: req.params.districtCode 
    });
    
    if (!district) {
      return res.status(404).json({
        success: false,
        error: 'District not found'
      });
    }
    
    res.json({
      success: true,
      data: district
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch district details',
      message: error.message
    });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await DistrictData.aggregate([
      { $match: { stateCode: '09' } },
      {
        $group: {
          _id: null,
          totalDistricts: { $sum: 1 },
          totalJobCards: { $sum: '$totalJobCards' },
          totalWorkers: { $sum: '$totalWorkers' },
          totalPersonDays: { $sum: '$personDaysGenerated' },
          totalExpenditure: { $sum: '$totalExpenditure' },
          avgDaysPerHousehold: { $avg: '$averageDaysPerHousehold' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats[0] || {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

router.get('/stats/top-performers', async (req, res) => {
  try {
    const metric = req.query.metric || 'personDaysGenerated';
    const limit = parseInt(req.query.limit) || 10;
    
    const topDistricts = await DistrictData.find({ stateCode: '09' })
      .select('districtName districtNameHindi personDaysGenerated averageDaysPerHousehold totalExpenditure')
      .sort({ [metric]: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      data: topDistricts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top performers',
      message: error.message
    });
  }
});

module.exports = router;