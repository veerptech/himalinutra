import axios from 'axios';
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
dotenv.config();

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const PHONEPE_SECRET = process.env.PHONEPE_SECRET!;
const PHONEPE_BASE_URL = 'https://api.phonepe.com/apis/hermes'; // or sandbox

export const generateChecksum = (payload: string) => {
  const checksum = CryptoJS.HmacSHA256(payload + '/pg/v1/pay' + PHONEPE_SECRET, PHONEPE_SECRET)
    .toString(CryptoJS.enc.Hex);
  return checksum;
};

export const createPayment = async (transactionId: string, amountInPaise: number, redirectUrl: string) => {
  const payload = {
    merchantId: PHONEPE_MERCHANT_ID,
    transactionId,
    amount: amountInPaise,
    redirectUrl,
    redirectMode: 'POST',
    callbackUrl: redirectUrl,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const checksum = generateChecksum(base64Payload);

  const res = await axios.post(
    `${PHONEPE_BASE_URL}/pg/v1/pay`,
    { request: base64Payload },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum + '###' + PHONEPE_SECRET,
      },
    }
  );

  return res.data;
};
