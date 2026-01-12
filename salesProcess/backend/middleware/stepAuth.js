const prisma = require("../utils/prisma");

const STEP_PERMISSIONS = {
  1: { role: "salesManager", requiresCreator: true },
  2: { role: null },
  3: { role: "marketingManager", requiresCreator: false },
  4: { role: "salesManager", requiresCreator: true },
  5: { role: "marketingManager", requiresCreator: false },
  6: { role: "marketingManager", requiresCreator: false },
};

const canAccessStep = (stepId) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const permissions = STEP_PERMISSIONS[stepId];

      // Step 2 is automatic
      if (!permissions.role) {
        return res.status(403).json({
          error: "This step is automatic and cannot be manually edited.",
        });
      }

      // Check if user has the required role
      if (user.role !== permissions.role) {
        return res.status(403).json({
          error: `Only ${permissions.role}s can access this step.`,
        });
      }

      // If step requires creator, check if user created the process
      if (permissions.requiresCreator) {
        const processId = parseInt(req.params.processId || req.body.processId);

        if (processId) {
          const process = await prisma.process.findUnique({
            where: { id: processId },
            include: { sale: true },
          });

          if (!process) {
            return res.status(404).json({ error: "Process not found" });
          }

          if (user.id !== process.sale?.salesManagerId) {
            return res.status(403).json({
              error:
                "Only the sales manager who created this process can access this step.",
            });
          }
        }
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
};

const canUpdateSale = async (req, res, next) => {
  try {
    const user = req.user;
    const saleId = parseInt(req.params.id);

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { process: true },
    });

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    // Check if user is the creator (Step 1 requires creator)
    if (user.role !== "salesManager" || user.id !== sale.salesManagerId) {
      return res.status(403).json({
        error: "Only the sales manager who created this sale can update it.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const canUpdateProcess = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const processId = parseInt(req.params.id);
    const { currentStep, consent, status } = req.body;

    const process = await prisma.process.findUnique({
      where: { id: processId },
      include: { sale: true },
    });

    if (!process) {
      return res.status(404).json({ error: "Process not found" });
    }

    if (currentStep === process.currentStep && status === "completed") {
      const currentStepPermissions = STEP_PERMISSIONS[process.currentStep];

      if (
        currentStepPermissions.role &&
        user.role !== currentStepPermissions.role
      ) {
        return res.status(403).json({
          error: `Only ${currentStepPermissions.role}s can complete step ${process.currentStep}.`,
        });
      }

      if (
        currentStepPermissions.requiresCreator &&
        user.id !== process.sale?.salesManagerId
      ) {
        return res.status(403).json({
          error:
            "Only the sales manager who created this process can complete this step.",
        });
      }

      return next();
    }

    if (currentStep !== undefined && currentStep !== process.currentStep) {
      
      if (process.currentStep === 2 && currentStep === 3) {
        return next();
      }

      const currentStepPermissions = STEP_PERMISSIONS[process.currentStep];

      if (
        currentStepPermissions.role &&
        user.role !== currentStepPermissions.role
      ) {
        return res.status(403).json({
          error: `Only ${currentStepPermissions.role}s can complete step ${process.currentStep}.`,
        });
      }

      if (
        currentStepPermissions.requiresCreator &&
        user.id !== process.sale?.salesManagerId
      ) {
        return res.status(403).json({
          error:
            "Only the sales manager who created this process can complete this step.",
        });
      }

      return next();
    }

    let stepToCheck = process.currentStep;

    if (consent !== undefined && consent !== process.consent) {
      stepToCheck = 4;
    }

    const permissions = STEP_PERMISSIONS[stepToCheck];

    if (permissions.role && user.role !== permissions.role) {
      return res.status(403).json({
        error: `Only ${permissions.role}s can modify step ${stepToCheck}.`,
      });
    }

    if (
      permissions.requiresCreator &&
      user.id !== process.sale?.salesManagerId
    ) {
      return res.status(403).json({
        error:
          "Only the sales manager who created this process can modify this step.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const canManageImages = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let stepId;

    if (req.method === "POST") {
      const { type } = req.body;
      const imageTypeToStep = {
        production: 3,
        installation: 4,
      };
      stepId = imageTypeToStep[type] || 3;
    } else if (req.method === "DELETE") {

      const imageId = parseInt(req.params.id);
      const image = await prisma.image.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      const imageTypeToStep = {
        production: 3,
        installation: 4,
      };
      stepId = imageTypeToStep[image.type] || 3;
    } else {
      return next();
    }

    const permissions = STEP_PERMISSIONS[stepId];

    if (!permissions || !permissions.role) {
      return res.status(403).json({
        error: `Cannot manage images for step ${stepId}.`,
      });
    }

    if (user.role !== permissions.role) {
      return res.status(403).json({
        error: `Only ${permissions.role}s can manage images for step ${stepId}.`,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  canAccessStep,
  canUpdateProcess,
  canUpdateSale,
  canManageImages,
  STEP_PERMISSIONS,
};
