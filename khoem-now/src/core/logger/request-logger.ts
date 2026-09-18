import type { Request, Response, NextFunction } from 'express';

export function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}
