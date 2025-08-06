import { Request, Response } from 'express';
import crypto from 'crypto';

const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { amount, transactionId, redirectUrl } = req.body;

    const merchantId = process.env.PHONEPE_MERCHANT_ID!;
    const saltKey = process.env.PHONEPE_SALT_KEY!;
    const saltIndex = process.env.PHONEPE_SALT_INDEX!;

    const payload = {
      merchantId,
      transactionId,
      amount: amount * 100, // ₹ to paisa
      merchantUserId: "guest_" + Date.now(),
      redirectUrl,
      redirectMode: "POST",
      callbackUrl: redirectUrl,
      paymentInstrument: {
        type: "UPI_INTENT",
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const stringToHash = base64Payload + "/pg/v1/pay" + saltKey;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const xVerify = sha256 + "###" + saltIndex;

    res.json({
      url: `https://api.phonepe.com/apis/hermes/pg/v1/pay`,
      payload: base64Payload,
      xVerify,
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default initiatePayment;
