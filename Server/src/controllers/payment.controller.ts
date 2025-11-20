import { NextFunction, Request, Response } from "express";
import { recordPayment } from "../services/payment.service";
import { PaymentReport } from "../types";

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Reporte de pagos/defaults
 */

/**
 * @swagger
 * /api/payment/report:
 *   post:
 *     tags: [Payments]
 *     summary: Reporta pago o default de un solicitante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apiKey
 *               - walletAddress
 *               - amount
 *               - status
 *               - paymentDate
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: API Key del prestamista
 *                 example: "lender_api_key_123456789"
 *               walletAddress:
 *                 type: string
 *                 description: Dirección de wallet del usuario
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Monto del pago
 *                 example: 1000
 *               status:
 *                 type: string
 *                 enum: ["paid", "defaulted"]
 *                 description: Estado del pago
 *                 example: "paid"
 *               paymentDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha del pago (ISO 8601)
 *                 example: "2024-11-20T15:30:00Z"
 *               requestId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la solicitud (opcional)
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Pago registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment recorded"
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                       example: "pay_123456789"
 *                     profileTier:
 *                       type: string
 *                       example: "B"
 */
export const reportPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body as PaymentReport;
    const result = await recordPayment(payload);

    return res.status(200).json({
      success: true,
      message: "Payment recorded",
      data: {
        paymentId: result.payment.id,
        profileTier: result.user.profileTier,
      },
    });
  } catch (error) {
    return next(error);
  }
};
