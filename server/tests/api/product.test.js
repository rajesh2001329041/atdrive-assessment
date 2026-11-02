const request = require('supertest');
const { authHeader } = require('../helpers');

jest.mock('../../src/models/product.model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
const Product = require('../../src/models/product.model');
const app = require('../../src/app');

const ID = '64b7f0c2a1b2c3d4e5f60718';
const product = { id: ID, name: 'Keyboard', price: 49.99, description: 'Mechanical', ownerId: 1 };

beforeEach(() => jest.resetAllMocks());

describe('products API', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
  });

  it('lists products', async () => {
    Product.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([product]) });
    const res = await request(app).get('/api/products').set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body).toEqual([product]);
  });

  it('creates a product owned by the logged-in user', async () => {
    Product.create.mockResolvedValue(product);
    const res = await request(app)
      .post('/api/products')
      .set(authHeader())
      .send({ name: 'Keyboard', price: 49.99, description: 'Mechanical' });
    expect(res.status).toBe(201);
    expect(Product.create).toHaveBeenCalledWith({ name: 'Keyboard', price: 49.99, description: 'Mechanical', ownerId: 1 });
  });

  it('rejects invalid product data', async () => {
    const res = await request(app).post('/api/products').set(authHeader()).send({ name: '', price: 'free' });
    expect(res.status).toBe(400);
    expect(Product.create).not.toHaveBeenCalled();
  });

  it('returns 404 when a product does not exist', async () => {
    Product.findById.mockResolvedValue(null);
    const res = await request(app).get(`/api/products/${ID}`).set(authHeader());
    expect(res.status).toBe(404);
  });

  it('returns 400 for a malformed id', async () => {
    const res = await request(app).get('/api/products/not-an-id').set(authHeader());
    expect(res.status).toBe(400);
  });

  it('updates a product', async () => {
    Product.findById.mockResolvedValue(product);
    Product.findByIdAndUpdate.mockResolvedValue({ ...product, price: 59 });
    const res = await request(app).put(`/api/products/${ID}`).set(authHeader()).send({ price: 59 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(59);
  });

  it("forbids updating another user's product", async () => {
    Product.findById.mockResolvedValue(product);
    const res = await request(app).put(`/api/products/${ID}`).set(authHeader(2)).send({ price: 1 });
    expect(res.status).toBe(403);
    expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("forbids deleting another user's product", async () => {
    Product.findById.mockResolvedValue(product);
    const res = await request(app).delete(`/api/products/${ID}`).set(authHeader(2));
    expect(res.status).toBe(403);
    expect(Product.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('returns 404 when updating a product that does not exist', async () => {
    Product.findById.mockResolvedValue(null);
    const res = await request(app).put(`/api/products/${ID}`).set(authHeader()).send({ price: 1 });
    expect(res.status).toBe(404);
  });

  it('rejects an empty update body', async () => {
    const res = await request(app).put(`/api/products/${ID}`).set(authHeader()).send({});
    expect(res.status).toBe(400);
  });

  it('deletes a product', async () => {
    Product.findById.mockResolvedValue(product);
    Product.findByIdAndDelete.mockResolvedValue(product);
    const res = await request(app).delete(`/api/products/${ID}`).set(authHeader());
    expect(res.status).toBe(204);
  });
});
