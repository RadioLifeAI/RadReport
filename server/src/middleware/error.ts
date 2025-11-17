import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction){
  const id = (req.headers['x-correlation-id'] as string) || uuidv4()
  ;(req as any).correlationId = id
  res.setHeader('X-Correlation-Id', id)
  next()
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction){
  const correlationId = (req as any).correlationId || uuidv4()
  const status = err?.status || 500
  const code = err?.code || 'INTERNAL_ERROR'
  const message = err?.message || 'Internal error'
  console.error(JSON.stringify({ level:'error', correlationId, status, code, message }))
  res.status(status).json({ error: message, code, correlationId })
}