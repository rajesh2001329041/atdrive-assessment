const productService = require('../services/product.service');

async function list(_req, res) {
  res.json(await productService.list());
}

async function getOne(req, res) {
  res.json(await productService.getById(req.params.id));
}

async function create(req, res) {
  res.status(201).json(await productService.create(req.body, req.user.id));
}

async function update(req, res) {
  res.json(await productService.update(req.params.id, req.body, req.user.id));
}

async function remove(req, res) {
  await productService.remove(req.params.id, req.user.id);
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };
