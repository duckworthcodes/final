const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const axios = require('axios'); // ✅ FIXED: Moved to top
require('dotenv').config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
// ✅ FIXED: Added file:// origin + wildcard for local dev
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (file://, Postman, curl)
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
    ];
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// 🔑 RAZORPAY KEYS
// ============================================
const RAZORPAY_KEY_ID = 'rzp_test_SyzFJuJdfn85Le';
const RAZORPAY_KEY_SECRET = 'Mw0FJ1jJoqOe3ta1LgUaiRyk';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

console.log('✅ Razorpay initialized with Key ID:', RAZORPAY_KEY_ID);

// ============================================
// 🔑 PROKERALA CREDENTIALS
// ============================================
const PROKERALA_CLIENT_ID = '8852a862-411f-46a2-8c6d-35f7d742cad3';
const PROKERALA_CLIENT_SECRET = 'RqdTliDE0gsnEd5405f82mASo3O4wEoGid6XVrRf';

// ============================================
// EMAIL CONFIGURATION
// ============================================
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// ============================================
// SEND CONFIRMATION EMAIL
// ============================================
async function sendBookingConfirmation(bookingData, paymentId) {
  const { devoteeName, email, pujaName, temple, pujaDate, amount } = bookingData;
  
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
// ENDPOINT 1: Create Razorpay Order
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
    
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(order_id + '|' + payment_id)
      .digest('hex');
    
    if (generatedSignature !== signature) {
      console.error('Signature mismatch!');
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
    
    console.log('✅ Signature verified!');
    
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
// ENDPOINT 3: Panchang (Prokerala Proxy)
// ============================================
app.post('/api/panchang', async (req, res) => {
  try {
    const { lat, lon, tz, cityName } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'Missing coordinates' });
    }
    
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    console.log(`📅 Fetching Panchang for ${cityName || 'unknown'} (${lat}, ${lon}) on ${dateStr}`);
    
    // Step 1: Get Access Token
  const tokenResponse = await axios.post(
    'https://api.prokerala.com/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: PROKERALA_CLIENT_ID,
        client_secret: PROKERALA_CLIENT_SECRET
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    const accessToken = tokenResponse.data.access_token;
    console.log('✅ Access token obtained');
    
    // Step 2: Get Panchang Data
    const panchangResponse = await axios.get(
      'https://api.prokerala.com/v2/astro/panchang',
      {
        params: {
          ayanamsa: 1,
          datetime: `${dateStr}T00:00:00+05:30`,
          coordinates: `${lat},${lon}`,
          tz: tz || 'Asia/Kolkata'
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ Panchang data received');
    console.log('📦 Raw Prokerala response keys:', Object.keys(panchangResponse.data));

    // ✅ FIXED: Prokerala wraps data under .data key
    const rawData = panchangResponse.data?.data || panchangResponse.data;
    
    res.json({
      success: true,
      data: rawData,
      city: cityName,
      date: dateStr
    });
    
  } catch (error) {
    // ✅ FIXED: Log the full error detail so you can debug
    const errDetail = error.response?.data || error.message;
    console.error('❌ Panchang API Error:', JSON.stringify(errDetail, null, 2));
    
    res.json({
      success: false,
      error: typeof errDetail === 'object' ? JSON.stringify(errDetail) : errDetail,
      useFallback: true
    });
  }
});

// ============================================
// TEST ENDPOINTS
// ============================================
app.get('/test', (req, res) => {
  res.json({ 
    message: '✅ Server running!',
    razorpay_configured: true,
    prokerala_configured: true,
    razorpay_key_id: RAZORPAY_KEY_ID
  });
});

app.get('/test-panchang', (req, res) => {
  res.json({
    message: 'Panchang API is ready!',
    endpoint: 'POST /api/panchang',
    example_body: { lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata', cityName: 'New Delhi' }
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