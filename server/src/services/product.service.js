const mongoose = require('mongoose');
const Product = require('../models/product.model');
const { HttpError } = require('../utils/httpError');

function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid product id');
}

const list = () => Product.find().sort({ createdAt: -1 });

async function getById(id) {
  assertValidId(id);
  const product = await Product.findById(id);
  if (!product) throw new HttpError(404, 'Product not found');
  return product;
}

const create = (data, ownerId) => Product.create({ ...data, ownerId });

// Anyone logged in can read products, but only the creator can change or delete them.
async function loadOwned(id, userId) {
  const product = await getById(id);
  if (product.ownerId !== userId) {
    throw new HttpError(403, 'You can only modify products you created');
  }
  return product;
}

async function update(id, data, userId) {
  await loadOwned(id, userId);
  return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function remove(id, userId) {
  await loadOwned(id, userId);
  await Product.findByIdAndDelete(id);
}

module.exports = { list, getById, create, update, remove };
