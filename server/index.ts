import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import verifyPaymentHandler from './verify-payment';
import initiatePaymentHandler from './initiate-payment'; // ✅ NEW

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Add both endpoints
app.post('/api/initiate-payment', initiatePaymentHandler);
app.post('/api/verify-payment', verifyPaymentHandler);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
