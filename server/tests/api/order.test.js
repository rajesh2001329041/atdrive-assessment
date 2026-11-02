const request = require('supertest');
const { authHeader } = require('../helpers');

jest.mock('../../src/models/product.model', () => ({ find: jest.fn() }));
jest.mock('../../src/repositories/order.repository', () => ({
  create: jest.fn(), findById: jest.fn(), findByUser: jest.fn(), update: jest.fn(), remove: jest.fn(),
}));
const Product = require('../../src/models/product.model');
const orders = require('../../src/repositories/order.repository');
const app = require('../../src/app');

const P1 = '64b7f0c2a1b2c3d4e5f60711';
const P2 = '64b7f0c2a1b2c3d4e5f60722';
const stored = { orderId: 5, userId: 1, productIds: [P1, P2], totalAmount: 30 };

beforeEach(() => jest.resetAllMocks());

describe('orders API', () => {
  it('requires authentication', async () => {
    expect((await request(app).post('/api/orders').send({})).status).toBe(401);
  });

  it('creates an order and computes the total on the server (ignoring client totals)', async () => {
    Product.find.mockResolvedValue([{ id: P1, price: 10 }, { id: P2, price: 20 }]);
    orders.create.mockResolvedValue(stored);

    const res = await request(app)
      .post('/api/orders')
      .set(authHeader(1))
      .send({ productIds: [P1, P2], totalAmount: 1 });

    expect(res.status).toBe(201);
    expect(orders.create).toHaveBeenCalledWith({ userId: 1, productIds: [P1, P2], totalAmount: 30 });
  });

  it('counts duplicate product ids as quantity', async () => {
    Product.find.mockResolvedValue([{ id: P1, price: 10 }]);
    orders.create.mockResolvedValue({ ...stored, productIds: [P1, P1], totalAmount: 20 });
    await request(app).post('/api/orders').set(authHeader(1)).send({ productIds: [P1, P1] });
    expect(orders.create).toHaveBeenCalledWith({ userId: 1, productIds: [P1, P1], totalAmount: 20 });
  });

  it('returns 400 when a product does not exist', async () => {
    Product.find.mockResolvedValue([{ id: P1, price: 10 }]);
    const res = await request(app).post('/api/orders').set(authHeader(1)).send({ productIds: [P1, P2] });
    expect(res.status).toBe(400);
    expect(res.body.details.missingProductIds).toEqual([P2]);
  });

  it('validates the body', async () => {
    const empty = await request(app).post('/api/orders').set(authHeader(1)).send({ productIds: [] });
    const bad = await request(app).post('/api/orders').set(authHeader(1)).send({ productIds: ['nope'] });
    expect(empty.status).toBe(400);
    expect(bad.status).toBe(400);
  });

  it('gets an order by id for its owner', async () => {
    orders.findById.mockResolvedValue(stored);
    const res = await request(app).get('/api/orders/5').set(authHeader(1));
    expect(res.status).toBe(200);
    expect(res.body.orderId).toBe(5);
  });

  it("hides another user's order behind a 404", async () => {
    orders.findById.mockResolvedValue(stored);
    const res = await request(app).get('/api/orders/5').set(authHeader(2));
    expect(res.status).toBe(404);
  });

  it('rejects a non-numeric order id', async () => {
    const res = await request(app).get('/api/orders/abc').set(authHeader(1));
    expect(res.status).toBe(400);
  });

  it('updates an order and recalculates the total', async () => {
    orders.findById.mockResolvedValue(stored);
    Product.find.mockResolvedValue([{ id: P2, price: 20 }]);
    orders.update.mockResolvedValue({ ...stored, productIds: [P2], totalAmount: 20 });
    const res = await request(app).put('/api/orders/5').set(authHeader(1)).send({ productIds: [P2] });
    expect(res.status).toBe(200);
    expect(orders.update).toHaveBeenCalledWith(5, { productIds: [P2], totalAmount: 20 });
  });

  it('deletes an order', async () => {
    orders.findById.mockResolvedValue(stored);
    orders.remove.mockResolvedValue(true);
    const res = await request(app).delete('/api/orders/5').set(authHeader(1));
    expect(res.status).toBe(204);
    expect(orders.remove).toHaveBeenCalledWith(5);
  });
});
