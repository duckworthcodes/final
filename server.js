const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Razorpay with your credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SxqJrDZrBdDhj7',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'oKZIFVNTYBAdGltbQ3O8IFXU'
});

// ============================================
// ENDPOINT 1: Create Order
// POST /api/create-order
// ============================================
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    // Validate amount - minimum 100 paise (₹1)
    if (!amount || amount < 100) {
      return res.status(400).json({ 
        error: 'Invalid amount. Minimum amount is ₹1 (100 paise)' 
      });
    }
    
    const options = {
      amount: amount,        // Amount in paise
      currency: currency,
      receipt: receipt || 'receipt_' + Date.now(),
      payment_capture: 1     // Auto-capture payments
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
    
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.error?.description || error.message
    });
  }
});

// ============================================
// ENDPOINT 2: Verify Payment Signature
// POST /api/verify-payment
// ============================================
app.post('/api/verify-payment', (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;
    
    // Check for missing fields
    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({ 
        error: 'Missing required fields: order_id, payment_id, signature' 
      });
    }
    
    // Generate signature using HMAC-SHA256
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'oKZIFVNTYBAdGltbQ3O8IFXU')
      .update(order_id + '|' + payment_id)
      .digest('hex');
    
    // Compare signatures
    if (generatedSignature === signature) {
      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        payment_id: payment_id,
        order_id: order_id
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid signature - payment may have been tampered'
      });
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      details: error.message
    });
  }
});

// ============================================
// TEST ENDPOINT: Check if server is running
// GET /test
// ============================================
app.get('/test', (req, res) => {
  res.json({ 
    message: '✅ MahaPoojan Server is running!',
    razorpay_configured: !!razorpay,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MahaPoojan Server running on http://localhost:${PORT}`);
  console.log(`✅ Test endpoint: http://localhost:${PORT}/test`);
  console.log(`✅ Create order: POST http://localhost:${PORT}/api/create-order`);
  console.log(`✅ Verify payment: POST http://localhost:${PORT}/api/verify-payment`);
});