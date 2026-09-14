// Fix 7: Global Express type augmentation
// This eliminates the repeated `(req as Request & { userId?: string })` cast pattern
// across every controller — just use `req.userId` directly.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export {};
