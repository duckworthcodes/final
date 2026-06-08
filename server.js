const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

// ============================================
// 🔑 YOUR CORRECT RAZORPAY TEST KEYS
// ============================================
const RAZORPAY_KEY_ID = 'rzp_test_SyzFJuJdfn85Le';
const RAZORPAY_KEY_SECRET = 'Mw0FJ1jJoqOe3ta1LgUaiRyk';

// Initialize Razorpay with your correct keys
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

console.log('✅ Razorpay initialized with Key ID:', RAZORPAY_KEY_ID);
console.log('✅ Key Secret (first 10 chars):', RAZORPAY_KEY_SECRET.substring(0, 10) + '...');

// ============================================
// EMAIL CONFIGURATION (Optional - won't affect payment)
// ============================================
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// ============================================
// SEND CONFIRMATION EMAIL FUNCTION
// ============================================
async function sendBookingConfirmation(bookingData, paymentId) {
  const { devoteeName, email, phone, gotra, pujaName, temple, pujaDate, sankalp, amount } = bookingData;
  
  const devoteeMailOptions = {
    from: `"MahaPoojan" <${process.env.EMAIL_USER || 'puja@mahapoojan.com'}>`,
    to: email,
    subject: `🙏 Puja Confirmed - ${pujaName} at ${temple}`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF6EE; border-radius: 20px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1A1208, #2E2316); padding: 30px; text-align: center;">
          <h1 style="color: #D4A853; margin: 0; font-size: 28px;">🪔 MahaPoojan</h1>
          <p style="color: #F5C77E; margin: 5px 0 0;">Your spiritual connection to the divine</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #C6721B;">✨ Puja Booking Confirmed!</h2>
          <p>Dear <strong>${devoteeName}</strong>,</p>
          <p>Your puja has been successfully booked. Payment ID: <strong>${paymentId}</strong></p>
          <div style="background: #FDF3E4; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <p><strong>📿 Puja:</strong> ${pujaName}</p>
            <p><strong>🏛️ Temple:</strong> ${temple}</p>
            <p><strong>📅 Date:</strong> ${pujaDate || 'Will be scheduled'}</p>
            <p><strong>💰 Amount:</strong> ₹${amount}</p>
          </div>
          <p>We will send you the live darshan link and video proof within 24 hours.</p>
          <p>🙏 Har Har Mahadev<br>Team MahaPoojan</p>
        </div>
      </div>
    `
  };
  
  try {
    await emailTransporter.sendMail(devoteeMailOptions);
    console.log(`✅ Email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return { success: false };
  }
}

// ============================================
// ENDPOINT 1: Create Order
// ============================================
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    console.log('📝 Creating order for amount:', amount);
    
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount. Minimum ₹1' });
    }
    
    const options = {
      amount: amount,
      currency: currency,
      receipt: receipt || 'receipt_' + Date.now(),
      payment_capture: 1
    };
    
    console.log('Order options:', options);
    const order = await razorpay.orders.create(options);
    console.log('✅ Order created:', order.id);
    
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error.error?.description || error.message);
    res.status(500).json({ 
      error: error.error?.description || 'Failed to create order'
    });
  }
});

// ============================================
// ENDPOINT 2: Verify Payment
// ============================================
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { order_id, payment_id, signature, bookingDetails } = req.body;
    
    console.log('Verifying payment:', { order_id, payment_id });
    
    // Verify signature using your correct secret
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(order_id + '|' + payment_id)
      .digest('hex');
    
    if (generatedSignature !== signature) {
      console.error('Signature mismatch!');
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
    
    console.log('✅ Signature verified successfully!');
    
    let emailStatus = { success: false };
    if (bookingDetails) {
      emailStatus = await sendBookingConfirmation(bookingDetails, payment_id);
    }
    
    res.json({
      success: true,
      payment_id: payment_id,
      email_sent: emailStatus.success
    });
    
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ============================================
// TEST ENDPOINT
// ============================================
app.get('/test', (req, res) => {
  res.json({ 
    message: '✅ Server running!',
    razorpay_configured: true,
    razorpay_key_id: RAZORPAY_KEY_ID
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Using Razorpay Key: ${RAZORPAY_KEY_ID}`);
});