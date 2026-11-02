const orderService = require('../services/order.service');

async function create(req, res) {
  res.status(201).json(await orderService.create(req.user.id, req.body.productIds));
}

async function list(req, res) {
  res.json(await orderService.listByUser(req.user.id));
}

async function getOne(req, res) {
  res.json(await orderService.getOwned(req.params.id, req.user.id));
}

async function update(req, res) {
  res.json(await orderService.update(req.params.id, req.user.id, req.body.productIds));
}

async function remove(req, res) {
  await orderService.remove(req.params.id, req.user.id);
  res.status(204).send();
}

module.exports = { create, list, getOne, update, remove };
