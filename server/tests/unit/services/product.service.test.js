jest.mock('../../../src/models/product.model', () => ({
  find: jest.fn(), findById: jest.fn(), create: jest.fn(), findByIdAndUpdate: jest.fn(), findByIdAndDelete: jest.fn(),
}));
const Product = require('../../../src/models/product.model');
const productService = require('../../../src/services/product.service');

const ID = '64b7f0c2a1b2c3d4e5f60718';
const owned = { id: ID, name: 'Keyboard', price: 10, ownerId: 1 };

beforeEach(() => jest.resetAllMocks());

describe('productService', () => {
  it('stamps the creator as owner on create', async () => {
    Product.create.mockResolvedValue(owned);
    await productService.create({ name: 'Keyboard', price: 10, description: '' }, 1);
    expect(Product.create).toHaveBeenCalledWith({ name: 'Keyboard', price: 10, description: '', ownerId: 1 });
  });

  it('rejects a malformed id with 400 before touching the database', async () => {
    await expect(productService.getById('nope')).rejects.toMatchObject({ status: 400 });
    expect(Product.findById).not.toHaveBeenCalled();
  });

  it('throws 404 for a missing product', async () => {
    Product.findById.mockResolvedValue(null);
    await expect(productService.getById(ID)).rejects.toMatchObject({ status: 404 });
  });

  it('lets the owner update and delete', async () => {
    Product.findById.mockResolvedValue(owned);
    Product.findByIdAndUpdate.mockResolvedValue({ ...owned, price: 20 });
    expect((await productService.update(ID, { price: 20 }, 1)).price).toBe(20);
    await productService.remove(ID, 1);
    expect(Product.findByIdAndDelete).toHaveBeenCalledWith(ID);
  });

  it('forbids other users from updating or deleting (403)', async () => {
    Product.findById.mockResolvedValue(owned);
    await expect(productService.update(ID, { price: 1 }, 2)).rejects.toMatchObject({ status: 403 });
    await expect(productService.remove(ID, 2)).rejects.toMatchObject({ status: 403 });
    expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(Product.findByIdAndDelete).not.toHaveBeenCalled();
  });
});
