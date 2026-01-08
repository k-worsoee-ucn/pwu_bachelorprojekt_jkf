const prisma = require("../controllers/prisma");

// Define which roles can access which steps
const STEP_PERMISSIONS = {
  1: { role: "salesManager", requiresCreator: true },
  2: { role: null },
  3: { role: "marketingManager", requiresCreator: false },
  4: { role: "salesManager", requiresCreator: true },
  5: { role: "marketingManager", requiresCreator: false },
  6: { role: "marketingManager", requiresCreator: false },
};

// Middleware to check if user can access a specific step for a process
const canAccessStep = (stepId) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const permissions = STEP_PERMISSIONS[stepId];

      // Step 2 is automatic, nobody can edit
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

// Middleware specifically for updating sales (Step 1)
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

    // Allow updates at any time - sales managers can re-edit their sales even after progression
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Middleware to check if user can update a process based on what's being changed
const canUpdateProcess = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const processId = parseInt(req.params.id);
    const { currentStep, consent, status } = req.body;

    // Fetch process with sale info
    const process = await prisma.process.findUnique({
      where: { id: processId },
      include: { sale: true },
    });

    if (!process) {
      return res.status(404).json({ error: "Process not found" });
    }

    // If completing a step (marking as completed without advancing), check current step permission
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

      // User has permission to complete current step
      return next();
    }

    // If advancing to a new step, check permission for the CURRENT step being completed
    // (not the new step), because completing a step is global for all roles
    if (currentStep !== undefined && currentStep !== process.currentStep) {
      // Allow automatic advancement from step 2 (production) to step 3
      if (process.currentStep === 2 && currentStep === 3) {
        return next();
      }

      // Check if user has permission to complete the CURRENT step
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

      // User has permission to complete current step, allow advancement
      return next();
    }

    // For other modifications (consent, etc.), check permission for the step being modified
    let stepToCheck = process.currentStep;

    // If updating consent, that's part of step 4
    if (consent !== undefined && consent !== process.consent) {
      stepToCheck = 4;
    }

    const permissions = STEP_PERMISSIONS[stepToCheck];

    // Check role
    if (permissions.role && user.role !== permissions.role) {
      return res.status(403).json({
        error: `Only ${permissions.role}s can modify step ${stepToCheck}.`,
      });
    }

    // Check creator for sales manager steps
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

// Middleware to check if user can upload/delete images for a step
const canManageImages = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Determine step from image type in request body (for upload) or from image in database (for delete)
    let stepId;

    if (req.method === "POST") {
      // For upload: get type from request body
      const { type } = req.body;
      const imageTypeToStep = {
        production: 3,
        installation: 4,
      };
      stepId = imageTypeToStep[type] || 3;
    } else if (req.method === "DELETE") {
      // For delete: get image type from database
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
      // For GET, no authorization needed
      return next();
    }

    // Check permissions for the step
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
