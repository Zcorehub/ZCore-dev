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
