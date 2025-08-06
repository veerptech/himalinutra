import { Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { sendConfirmationEmail } from './utils/email';

const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { transactionId, userEmail, orderDetails } = req.body;

    const orderDetailsString = JSON.stringify(orderDetails);

    if (!userEmail || !orderDetailsString) {
      return res.status(400).json({ success: false, message: 'Missing email or order details' });
    }

    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      transactionId,
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const saltKey = process.env.PHONEPE_SALT_KEY!;
    const saltIndex = process.env.PHONEPE_SALT_INDEX!;

    const stringToHash = base64Payload + '/pg/v1/status' + saltKey;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = sha256 + '###' + saltIndex;

    const response = await axios.get(
      `https://api.phonepe.com/apis/hermes/pg/v1/status/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': process.env.PHONEPE_MERCHANT_ID!,
        },
      }
    );

    const status = response.data?.data?.status;

    if (status === 'SUCCESS') {
      await sendConfirmationEmail(userEmail, orderDetailsString);
      return res.status(200).json({ success: true, message: '✅ Payment verified & email sent.' });
    } else {
      return res.status(400).json({ success: false, message: '❌ Payment failed.' });
    }
  } catch (err) {
    console.error('Verification Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default verifyPayment;
