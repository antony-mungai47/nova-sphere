import { CartService } from "./CartService";
import { InventoryService } from "../inventory/InventoryService";
import { prisma } from "@/lib/prisma";

// Mock prisma and InventoryService
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(prisma)),
    cart: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    cartItem: {
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    cartEvent: {
      create: jest.fn(),
    },
    inventory: {
      findUnique: jest.fn(),
    }
  }
}));

jest.mock("../inventory/InventoryService", () => ({
  InventoryService: {
    validateAvailability: jest.fn()
  }
}));

describe("CartService", () => {
  const userId = "user123";

  beforeEach(() => {
    jest.clearAllMocks();
    
    (prisma.cart.findFirst as jest.Mock).mockResolvedValue({ id: "cart1", userId, items: [] });
    (prisma.product.findUniqueOrThrow as jest.Mock).mockResolvedValue({ 
      id: "prod1", 
      price: 100, 
      images: [],
      ownerTenantId: "vendor1"
    });
  });

  it("adds an item successfully", async () => {
    (InventoryService.validateAvailability as jest.Mock).mockResolvedValue(true);
    
    await CartService.add(userId, "prod1", 1);
    
    expect(InventoryService.validateAvailability).toHaveBeenCalledWith("prod1", 1, prisma);
    expect(prisma.cartItem.create).toHaveBeenCalled();
    expect(prisma.cartEvent.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ eventType: "ADD" })
    }));
  });

  it("fails if inventory is exceeded", async () => {
    (InventoryService.validateAvailability as jest.Mock).mockRejectedValue(new Error("Insufficient stock"));
    
    await expect(CartService.add(userId, "prod1", 50)).rejects.toThrow("Insufficient stock");
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });
});
