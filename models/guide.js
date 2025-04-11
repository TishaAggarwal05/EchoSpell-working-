const mongoose = require('mongoose');

const GuideSchema = new mongoose.Schema({}, { strict: false }); // for any structure
const Guide = mongoose.model('Guidence', GuideSchema, 'guidences'); 
module.exports = Guide;