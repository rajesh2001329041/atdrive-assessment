const Product = require('../models/product.model');
const orders = require('../repositories/order.repository');
const { HttpError } = require('../utils/httpError');

async function computeTotal(productIds) {
  const unique = [...new Set(productIds)];
  const products = await Product.find({ _id: { $in: unique } });
  if (products.length !== unique.length) {
    const found = new Set(products.map((p) => String(p.id)));
    const missing = unique.filter((id) => !found.has(id));
    throw new HttpError(400, 'Some products do not exist', { missingProductIds: missing });
  }
  const priceById = new Map(products.map((p) => [String(p.id), p.price]));
  const total = productIds.reduce((sum, id) => sum + priceById.get(id), 0);
  return Math.round(total * 100) / 100;
}

// Users can only access their own orders. 404 (not 403) avoids leaking that an id exists.
async function getOwned(orderId, userId) {
  const order = await orders.findById(orderId);
  if (!order || order.userId !== userId) throw new HttpError(404, 'Order not found');
  return order;
}

async function create(userId, productIds) {
  const totalAmount = await computeTotal(productIds);
  return orders.create({ userId, productIds, totalAmount });
}

const listByUser = (userId) => orders.findByUser(userId);

async function update(orderId, userId, productIds) {
  await getOwned(orderId, userId);
  const totalAmount = await computeTotal(productIds);
  return orders.update(orderId, { productIds, totalAmount });
}

async function remove(orderId, userId) {
  await getOwned(orderId, userId);
  await orders.remove(orderId);
}

module.exports = { create, listByUser, getOwned, update, remove };
