const mongoose = require('mongoose');
const { mongoUri } = require('../config/env');

async function connectMongo() {
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
}

module.exports = { connectMongo };
