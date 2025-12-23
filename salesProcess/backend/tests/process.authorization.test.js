describe("Process Authorization Middleware", () => {
  let mockReq, mockRes, mockNext;
  let canUpdateProcess;
  let mockPrisma;

  beforeAll(() => {
    // Setup mock Prisma before requiring middleware
    mockPrisma = {
      process: {
        findUnique: jest.fn(),
      },
    };

    jest.doMock("../controllers/prisma", () => mockPrisma);

    // Now require the middleware
    canUpdateProcess = require("../middleware/stepAuth").canUpdateProcess;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: {
        id: 1,
        name: "Test User",
        role: "salesManager",
        email: "test@example.com",
      },
      params: { id: 1 },
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterAll(() => {
    jest.dontMock("../controllers/prisma");
  });

  describe("SalesManager Authorization - Step 1 & 4", () => {
    test("should allow salesManager to complete step 1 if they are the creator", async () => {
      const testProcess = {
        id: 1,
        currentStep: 1,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 1, role: "salesManager" };
      mockReq.body = { currentStep: 2 };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should deny salesManager from completing step 1 if they are NOT the creator", async () => {
      const testProcess = {
        id: 1,
        currentStep: 1,
        sale: { id: 1, salesManagerId: 999 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 1, role: "salesManager" };
      mockReq.body = { currentStep: 2 };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should allow salesManager to complete step 4 if they are the creator", async () => {
      const testProcess = {
        id: 1,
        currentStep: 4,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 1, role: "salesManager" };
      mockReq.body = { currentStep: 5 };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should deny salesManager from accessing step 3 (marketingManager only)", async () => {
      const testProcess = {
        id: 1,
        currentStep: 3,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 1, role: "salesManager" };
      mockReq.body = { currentStep: 4 };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("MarketingManager Authorization - Step 3, 5 & 6", () => {
    test("should allow marketingManager to complete step 3", async () => {
      const testProcess = {
        id: 1,
        currentStep: 3,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 2, role: "marketingManager" };
      mockReq.body = { currentStep: 4 };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should allow marketingManager to complete step 5", async () => {
      const testProcess = {
        id: 1,
        currentStep: 5,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 2, role: "marketingManager" };
      mockReq.body = { currentStep: 6 };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should allow marketingManager to complete step 6", async () => {
      const testProcess = {
        id: 1,
        currentStep: 6,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 2, role: "marketingManager" };
      mockReq.body = { currentStep: 6, status: "completed" };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should deny marketingManager from accessing step 1 (salesManager only)", async () => {
      const testProcess = {
        id: 1,
        currentStep: 1,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 2, role: "marketingManager" };
      mockReq.body = { currentStep: 2 };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should deny marketingManager from accessing step 4 (salesManager only)", async () => {
      const testProcess = {
        id: 1,
        currentStep: 4,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 2, role: "marketingManager" };
      mockReq.body = { currentStep: 5 };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Authentication Check", () => {
    test("should deny access if user is not authenticated", async () => {
      mockReq.user = null;
      mockReq.body = { currentStep: 2 };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Authentication required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Process Not Found", () => {
    test("should return 404 if process does not exist", async () => {
      mockPrisma.process.findUnique.mockResolvedValue(null);
      mockReq.user = { id: 1, role: "salesManager" };
      mockReq.body = { currentStep: 2 };
      mockReq.params.id = 999;

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Process not found" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Automatic Step 2 Advancement", () => {
    test("should allow automatic advancement from step 2 to step 3", async () => {
      const testProcess = {
        id: 1,
        currentStep: 2,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 3, role: "viewer" };
      mockReq.body = { currentStep: 3 };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe("Consent Modification Authorization", () => {
    test("should allow salesManager to modify consent for step 4", async () => {
      const testProcess = {
        id: 1,
        currentStep: 4,
        consent: false,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 1, role: "salesManager" };
      mockReq.body = { consent: true };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe("Completing Current Step Without Advancement", () => {
    test("should allow salesManager to mark step 1 as completed without advancing", async () => {
      const testProcess = {
        id: 1,
        currentStep: 1,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 1, role: "salesManager" };
      mockReq.body = { currentStep: 1, status: "completed" };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should allow marketingManager to mark step 3 as completed without advancing", async () => {
      const testProcess = {
        id: 1,
        currentStep: 3,
        sale: { id: 1, salesManagerId: 1 },
      };

      mockPrisma.process.findUnique.mockResolvedValue(testProcess);
      mockReq.user = { id: 2, role: "marketingManager" };
      mockReq.body = { currentStep: 3, status: "completed" };

      await canUpdateProcess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});
