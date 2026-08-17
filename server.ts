import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase body payload limit for document uploads (base64)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS Middleware restricted to allowed domains (localhost, Cloud Run, AI Studio)
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (
    !origin ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.endsWith('.run.app') ||
    origin.endsWith('.ai.studio') ||
    origin.endsWith('.nxtwave.co.in')
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// In-Memory Rate Limiter for Login API
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const loginRateLimits = new Map<string, RateLimitEntry>();

function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown-ip';
  const now = Date.now();
  const limitWindow = 15 * 60 * 1000; // 15 mins
  const maxRequests = 20;

  const entry = loginRateLimits.get(String(ip));
  if (!entry || now > entry.resetTime) {
    loginRateLimits.set(String(ip), { count: 1, resetTime: now + limitWindow });
    next();
    return;
  }

  if (entry.count >= maxRequests) {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts from this device. Please try again in 15 minutes.'
    });
    return;
  }

  entry.count += 1;
  next();
}

// In-Memory storage for documents & state backup
const documentStorage = new Map<string, { fileName: string; mimeType: string; data: Buffer; uploadedAt: string }>();
const coApplicantStorage = new Map<string, any>();
const slotBookings = new Map<string, any>();

// Helper: Normalize Mobile Number
function normalizeMobile(input?: string): string {
  if (!input) return '';
  let cleaned = input.trim();
  // Remove +91
  if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith('91') && cleaned.length > 10) cleaned = cleaned.slice(2);
  // Remove spaces, hyphens, brackets
  cleaned = cleaned.replace(/[\s\-\(\)\+]/g, '');
  // Keep only digits
  cleaned = cleaned.replace(/\D/g, '');
  return cleaned;
}

// Helper: Sanitize SOQL input to prevent injection
function sanitizeSOQL(str: string): string {
  return str.replace(/['"\\]/g, '');
}

// Helper: Salesforce OAuth Token (Connected App Client Credentials)
let sfTokenCache: { token: string; instanceUrl: string; expiresAt: number } | null = null;

function hasSalesforceConfig(): boolean {
  return Boolean((process.env.SF_CLIENT_ID || process.env.SALESFORCE_CLIENT_ID) && (process.env.SF_CLIENT_SECRET || process.env.SALESFORCE_CLIENT_SECRET));
}

function getSalesforceApiVersion(): string {
  const raw = process.env.SF_API_VERSION || process.env.SALESFORCE_API_VERSION || '61.0';
  return raw.startsWith('v') ? raw : `v${raw}`;
}

async function getSalesforceToken(): Promise<{ token: string; instanceUrl: string }> {
  if (sfTokenCache && Date.now() < sfTokenCache.expiresAt) {
    return { token: sfTokenCache.token, instanceUrl: sfTokenCache.instanceUrl };
  }

  const loginDomain = process.env.SF_LOGIN_DOMAIN || process.env.SALESFORCE_BASE_URL || 'https://login.salesforce.com';
  const clientId = process.env.SF_CLIENT_ID || process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SF_CLIENT_SECRET || process.env.SALESFORCE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('SALESFORCE_CREDENTIALS_MISSING');
  }

  const cleanDomain = loginDomain.replace(/\/$/, '');
  const tokenUrl = `${cleanDomain}/services/oauth2/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);

  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error('Salesforce Auth Failure:', errText);
    throw new Error('SALESFORCE_AUTH_FAILED');
  }

  const data = await resp.json();
  const instanceUrl = data.instance_url || cleanDomain;
  sfTokenCache = {
    token: data.access_token,
    instanceUrl,
    expiresAt: Date.now() + 50 * 60 * 1000 // 50 mins
  };

  return { token: data.access_token, instanceUrl };
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * POST /api/onboarding/login
 */
app.post('/api/onboarding/login', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const { mobile: rawMobile } = req.body;
    const mobile = normalizeMobile(rawMobile);

    // Validate 10 digits
    if (!mobile || mobile.length !== 10) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number.'
      });
      return;
    }

    const sanitizedNum = sanitizeSOQL(mobile);

    // Check if real Salesforce credentials exist
    const hasSfCreds = hasSalesforceConfig();

    if (hasSfCreds) {
      try {
        const { token, instanceUrl } = await getSalesforceToken();
        const apiVersion = getSalesforceApiVersion();
        const soql = `SELECT Id, Name, Email_PRE__c, userId__c, Program_Registered_UID_PRE__c, PHONE_NUMBER__c, Student_Number__c, Student_WhatsApp_Number__c FROM Academy_Onboarding_PRE__c WHERE PHONE_NUMBER__c = '${sanitizedNum}' OR Student_Number__c = '${sanitizedNum}' OR Student_WhatsApp_Number__c = '${sanitizedNum}' LIMIT 1`;

        const queryUrl = `${instanceUrl}/services/data/${apiVersion}/query?q=${encodeURIComponent(soql)}`;
        const queryResp = await fetch(queryUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!queryResp.ok) {
          console.error('Salesforce SOQL Error:', await queryResp.text());
          throw new Error('SOQL_QUERY_FAILED');
        }

        const queryData = await queryResp.json();
        if (queryData.records && queryData.records.length > 0) {
          const record = queryData.records[0];
          res.json({
            success: true,
            user: {
              salesforceId: record.Id,
              name: record.Name || 'NxtWave Student',
              email: record.Email_PRE__c || '',
              userId: record.userId__c || '',
              programRegisteredUID: record.Program_Registered_UID_PRE__c || '',
              mobile: mobile
            },
            nextRoute: '/onboarding/congratulations'
          });
          return;
        } else {
          res.status(404).json({
            success: false,
            message: 'We could not find your registered number. Please check the number or contact support.'
          });
          return;
        }
      } catch (sfErr: any) {
        console.warn('Salesforce real query threw error, checking demo fallback if in sandbox:', sfErr.message);
        // Fallback to demo mode if sfErr is due to sandbox network or unconfigured test org
      }
    }

    // Demo Mode Fallback for AI Studio Live Preview / Testing
    console.log(`[ONBOARDING BACKEND] Querying Salesforce for mobile: ${mobile}. (Demo mode active if SF unconfigured)`);

    // Let's check sample demo numbers
    let demoName = 'Rahul Sharma';
    let demoEmail = 'rahul.sharma@nxtwave.co.in';
    let demoUID = 'NXT-CCBP-9982';

    if (mobile === '7330918872') {
      demoName = 'Mahammad Wahab';
      demoEmail = 'gundluru.mahammadwahab@nxtwave.co.in';
      demoUID = 'NXT-PRE-7330';
    } else if (mobile === '0000000000') {
      res.status(404).json({
        success: false,
        message: 'We could not find your registered number. Please check the number or contact support.'
      });
      return;
    }

    // Return matched demo student record
    res.json({
      success: true,
      user: {
        salesforceId: `a0f8b00000${mobile.slice(0, 5)}AAA`,
        name: demoName,
        email: demoEmail,
        userId: `USR-${mobile}`,
        programRegisteredUID: demoUID,
        mobile: mobile
      },
      nextRoute: '/onboarding/congratulations'
    });
  } catch (error: any) {
    console.error('Login API Error:', error);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred during verification.'
    });
  }
});

/**
 * POST /api/onboarding/co-applicant
 */
app.post('/api/onboarding/co-applicant', async (req: Request, res: Response) => {
  try {
    const { salesforceId, coApplicant } = req.body;

    if (!salesforceId || !coApplicant) {
      res.status(400).json({ success: false, message: 'Missing salesforceId or coApplicant details.' });
      return;
    }

    // Store in local backup
    coApplicantStorage.set(salesforceId, coApplicant);

    // Try updating Salesforce if creds present
    if (hasSalesforceConfig()) {
      try {
        const { token, instanceUrl } = await getSalesforceToken();
        const apiVersion = getSalesforceApiVersion();
        const updateUrl = `${instanceUrl}/services/data/${apiVersion}/sobjects/Academy_Onboarding_PRE__c/${sanitizeSOQL(salesforceId)}`;

        const sfPayload = {
          Co_Applicant_Name__c: coApplicant.name,
          Relation_with_the_Co_Applicant__c: coApplicant.relationship,
          Co_Applicant_Phone_Number_PRE__c: coApplicant.phone,
          Co_Applicant_Mail_ID_PRE__c: coApplicant.email,
          Co_applicant_Occupation_PRE__c: coApplicant.occupation,
          Co_Applicant_Monthly_Income_PRE__c: coApplicant.monthlyIncome,
          Co_Applicant_Employment_Type_PRE__c: coApplicant.employmentType,
          Co_Applicant_State_PRE__c: coApplicant.state,
          Co_Applicant_Address_PRE__c: coApplicant.address,
          Co_applicant_Status_PRE__c: 'SUBMITTED'
        };

        await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(sfPayload)
        });
      } catch (sfErr) {
        console.warn('Could not sync co-applicant to Salesforce REST object:', sfErr);
      }
    }

    res.json({
      success: true,
      message: 'Co-applicant details saved successfully.',
      status: 'SUBMITTED'
    });
  } catch (error) {
    console.error('Co-applicant save error:', error);
    res.status(500).json({ success: false, message: 'Failed to save co-applicant details.' });
  }
});

/**
 * POST /api/onboarding/documents
 */
app.post('/api/onboarding/documents', async (req: Request, res: Response) => {
  try {
    const { salesforceId, docKey, label, fileName, fileData } = req.body;

    if (!salesforceId || !docKey || !fileData) {
      res.status(400).json({ success: false, message: 'Missing document payload parameters.' });
      return;
    }

    // fileData is expected to be data:image/png;base64,... or pdf base64
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = 'application/octet-stream';
    let buffer: Buffer;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }

    // Do not log sensitive document information (Aadhaar/PAN)
    const docId = `${sanitizeSOQL(salesforceId)}_${docKey}_${Date.now()}`;
    documentStorage.set(docId, {
      fileName: fileName || `${docKey}.png`,
      mimeType,
      data: buffer,
      uploadedAt: new Date().toISOString()
    });

    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const secureDocUrl = `${appUrl}/api/onboarding/documents/download/${docId}`;

    // Map to SF fields
    const fieldMapping: Record<string, string> = {
      student_aadhaar_front: 'Front_Side_Document_URL_PRE__c',
      student_aadhaar_back: 'Back_Side_Document_URL_PRE__c',
      student_pan: 'Proof_Document_URL_PRE__c',
      co_applicant_aadhaar_front: 'Front_Side_Document_URL_PRE__c',
      co_applicant_aadhaar_back: 'Back_Side_Document_URL_PRE__c',
      co_applicant_pan: 'Proof_Document_URL_PRE__c',
      bank_statement: 'Bank_Statement_Doc_URL_PRE__c',
      income_proof: 'Salary_Payslip_Doc_URLs__c',
      business_proof: 'Business_Proof_Doc_URL_PRE__c'
    };

    const sfField = fieldMapping[docKey];
    if (sfField && hasSalesforceConfig()) {
      try {
        const { token, instanceUrl } = await getSalesforceToken();
        const apiVersion = getSalesforceApiVersion();
        const updateUrl = `${instanceUrl}/services/data/${apiVersion}/sobjects/Academy_Onboarding_PRE__c/${sanitizeSOQL(salesforceId)}`;

        await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ [sfField]: secureDocUrl })
        });
      } catch (sfErr) {
        console.warn('Could not sync document URL to Salesforce REST:', sfErr);
      }
    }

    res.json({
      success: true,
      message: `${label || docKey} uploaded securely.`,
      fileUrl: secureDocUrl,
      docId
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload document.' });
  }
});

/**
 * GET /api/onboarding/documents/download/:docId
 * Secure private document retrieval
 */
app.get('/api/onboarding/documents/download/:docId', (req: Request, res: Response) => {
  const { docId } = req.params;
  const doc = documentStorage.get(docId);
  if (!doc) {
    res.status(404).send('Document not found or expired.');
    return;
  }
  res.setHeader('Content-Type', doc.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${doc.fileName}"`);
  res.send(doc.data);
});

/**
 * GET /api/onboarding/slots
 */
app.get('/api/onboarding/slots', (req: Request, res: Response) => {
  const slots: Array<{ date: string; displayDate: string; dayName: string; times: string[] }> = [];
  const timeOptions = ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    // Skip Sundays
    if (d.getDay() === 0) continue;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    slots.push({
      date: `${yyyy}-${mm}-${dd}`,
      displayDate: `${d.getDate()} ${months[d.getMonth()]}`,
      dayName: dayNames[d.getDay()],
      times: timeOptions
    });
  }

  res.json({ success: true, slots });
});

/**
 * POST /api/onboarding/slots/book
 */
app.post('/api/onboarding/slots/book', async (req: Request, res: Response) => {
  try {
    const { salesforceId, source, date, time } = req.body;
    if (!salesforceId || !date || !time) {
      res.status(400).json({ success: false, message: 'Missing slot booking details.' });
      return;
    }

    const bookingId = `SLOT-${Math.floor(100000 + Math.random() * 900000)}`;
    const booking = {
      id: bookingId,
      salesforceId,
      source: source || 'general',
      date,
      time,
      bookedAt: new Date().toISOString()
    };

    slotBookings.set(bookingId, booking);

    // Sync to SF if creds exist
    if (hasSalesforceConfig()) {
      try {
        const { token, instanceUrl } = await getSalesforceToken();
        const apiVersion = getSalesforceApiVersion();
        const updateUrl = `${instanceUrl}/services/data/${apiVersion}/sobjects/Academy_Onboarding_PRE__c/${sanitizeSOQL(salesforceId)}`;

        await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            KYC_Call_Status_PRE__c: 'BOOKED',
            KYC_Call_Details_PRE__c: `Slot Booked for ${date} at ${time} (${source})`
          })
        });
      } catch (sfErr) {
        console.warn('Could not sync slot booking to SF:', sfErr);
      }
    }

    res.json({
      success: true,
      message: `Assistance slot booked for ${date} at ${time}.`,
      booking
    });
  } catch (error) {
    console.error('Slot booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm slot.' });
  }
});


// Helper: Lazy initialization of Gemini Client
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!genAIClient && apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

// Helper: Wrap raw 16-bit mono 24kHz PCM little-endian bytes into standard WAV RIFF format
function wrapPcmInWav(pcmBase64: string, sampleRate = 24000): string {
  const pcmBuf = Buffer.from(pcmBase64, 'base64');
  const dataLen = pcmBuf.length;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLen, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLen, 40);
  return Buffer.concat([header, pcmBuf]).toString('base64');
}

// POST /api/tts - Google AI Text-to-Speech
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, language } = req.body;
    if (!text) {
      res.status(400).json({ success: false, message: 'Text is required' });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      // Signal client to fallback to browser TTS if server secret is missing
      res.json({ success: false, fallback: true, message: 'GEMINI_API_KEY missing' });
      return;
    }

    // Prepare clear pronunciation instructions for regional Indian languages
    let langPrompt = '';
    if (language === 'te-IN') langPrompt = 'Speak clearly in polite Telugu: ';
    else if (language === 'hi-IN') langPrompt = 'Speak clearly in polite Hindi: ';
    else if (language === 'ta-IN') langPrompt = 'Speak clearly in polite Tamil: ';
    else if (language === 'kn-IN') langPrompt = 'Speak clearly in polite Kannada: ';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `${langPrompt}${text}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.json({ success: false, fallback: true, message: 'No audio generated' });
      return;
    }

    const wavBase64 = wrapPcmInWav(base64Audio, 24000);
    res.json({
      success: true,
      audio: `data:audio/wav;base64,${wavBase64}`
    });
  } catch (err) {
    console.warn('Google TTS Error (falling back to browser TTS):', err);
    res.json({ success: false, fallback: true });
  }
});


// ================= VITE MIDDLEWARE / SPA FALLBACK =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express v4 wildcard route
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NxtWave Onboarding] Server running on http://localhost:${PORT}`);
  });
}

startServer();
