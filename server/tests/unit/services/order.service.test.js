jest.mock('../../../src/models/product.model', () => ({ find: jest.fn() }));
jest.mock('../../../src/repositories/order.repository', () => ({
  create: jest.fn(), findById: jest.fn(), findByUser: jest.fn(), update: jest.fn(), remove: jest.fn(),
}));
const Product = require('../../../src/models/product.model');
const orders = require('../../../src/repositories/order.repository');
const orderService = require('../../../src/services/order.service');

const A = '64b7f0c2a1b2c3d4e5f60711';
const B = '64b7f0c2a1b2c3d4e5f60722';
const stored = { orderId: 5, userId: 1, productIds: [A], totalAmount: 10 };

beforeEach(() => jest.resetAllMocks());

describe('orderService.create', () => {
  it('sums current product prices', async () => {
    Product.find.mockResolvedValue([{ id: A, price: 10 }, { id: B, price: 20 }]);
    await orderService.create(1, [A, B]);
    expect(orders.create).toHaveBeenCalledWith({ userId: 1, productIds: [A, B], totalAmount: 30 });
  });

  it('treats repeated ids as quantity', async () => {
    Product.find.mockResolvedValue([{ id: A, price: 10 }]);
    await orderService.create(1, [A, A, A]);
    expect(orders.create).toHaveBeenCalledWith({ userId: 1, productIds: [A, A, A], totalAmount: 30 });
  });

  it('rounds to 2 decimals to avoid floating point drift', async () => {
    Product.find.mockResolvedValue([{ id: A, price: 0.1 }, { id: B, price: 0.2 }]);
    await orderService.create(1, [A, B]);
    expect(orders.create.mock.calls[0][0].totalAmount).toBe(0.3);
  });

  it('reports which products are missing with a 400', async () => {
    Product.find.mockResolvedValue([{ id: A, price: 10 }]);
    await expect(orderService.create(1, [A, B])).rejects.toMatchObject({
      status: 400,
      details: { missingProductIds: [B] },
    });
    expect(orders.create).not.toHaveBeenCalled();
  });
});

describe('orderService ownership', () => {
  it('returns an order to its owner', async () => {
    orders.findById.mockResolvedValue(stored);
    expect(await orderService.getOwned(5, 1)).toEqual(stored);
  });

  it("answers 404 for someone else's order and for a missing one", async () => {
    orders.findById.mockResolvedValueOnce(stored);
    await expect(orderService.getOwned(5, 2)).rejects.toMatchObject({ status: 404 });
    orders.findById.mockResolvedValueOnce(null);
    await expect(orderService.getOwned(99, 1)).rejects.toMatchObject({ status: 404 });
  });

  it("blocks update and delete of someone else's order", async () => {
    orders.findById.mockResolvedValue(stored);
    await expect(orderService.update(5, 2, [A])).rejects.toMatchObject({ status: 404 });
    await expect(orderService.remove(5, 2)).rejects.toMatchObject({ status: 404 });
    expect(orders.update).not.toHaveBeenCalled();
    expect(orders.remove).not.toHaveBeenCalled();
  });

  it('recalculates the total when the owner updates', async () => {
    orders.findById.mockResolvedValue(stored);
    Product.find.mockResolvedValue([{ id: B, price: 20 }]);
    await orderService.update(5, 1, [B]);
    expect(orders.update).toHaveBeenCalledWith(5, { productIds: [B], totalAmount: 20 });
  });
});
