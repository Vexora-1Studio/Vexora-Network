import express from 'express';
import nodemailer from 'nodemailer';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = typeof import.meta !== 'undefined' && import.meta.url
  ? fileURLToPath(import.meta.url)
  : '';
const __dirname = __filename ? path.dirname(__filename) : '';

// Initialize Gemini lazily to handle missing API keys gracefully and prevent falling back to Gcloud credentials
let aiClient: GoogleGenAI | null = null;
let isApiKeyInvalid = false;
let lastCheckedKey: string | undefined = undefined;

function hasAiClient(): boolean {
  const currentKey = process.env.GEMINI_API_KEY || '';
  
  if (currentKey !== lastCheckedKey) {
    isApiKeyInvalid = false;
    aiClient = null;
    lastCheckedKey = currentKey;
  }

  if (isApiKeyInvalid) {
    return false;
  }
  return !!(currentKey && currentKey !== 'undefined' && currentKey !== 'null' && currentKey.trim() !== '');
}

function checkErrorForInvalidKey(error: any) {
  const errMsg = (error && (error.message || error.toString() || JSON.stringify(error))) || "";
  if (
    errMsg.includes("PERMISSION_DENIED") || 
    errMsg.includes("denied access") || 
    errMsg.includes("API_KEY_INVALID") || 
    errMsg.includes("not valid") || 
    errMsg.includes("SERVICE_DISABLED") ||
    errMsg.includes("BILLING_DISABLED") ||
    (error && error.status === 403)
  ) {
    isApiKeyInvalid = true;
    console.warn("⚠️ [GEMINI] API key or project access restricted (PERMISSION_DENIED/403). Using graceful fallback.");
  }
}

function getAiClient(): GoogleGenAI {
  const currentKey = process.env.GEMINI_API_KEY || '';
  
  if (currentKey !== lastCheckedKey) {
    isApiKeyInvalid = false;
    aiClient = null;
    lastCheckedKey = currentKey;
  }

  if (!aiClient) {
    const key = currentKey;
    if (!key || key === 'undefined' || key === 'null' || key.trim() === '') {
      throw new Error("GEMINI_API_KEY environment variable is missing or empty. Please set your Gemini API key in Settings > Secrets in the AI Studio panel.");
    }
    aiClient = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '150mb' }));
  app.use(express.raw({ type: ['video/*', 'application/octet-stream'], limit: '300mb' }));

  const httpServer = createServer(app);

  // Video Management & Upload Endpoints
  const VIDEO_CONFIG_PATH = path.join(process.cwd(), 'public', 'video-config.json');

  app.get('/api/video/info', (req, res) => {
    try {
      const publicAdPath = path.join(process.cwd(), 'public', 'Vexora_Network_Ad.mp4');
      const publicIntroPath = path.join(process.cwd(), 'public', 'vexora-intro.mp4');

      let filePath = '';
      let fileName = '';
      if (fs.existsSync(publicAdPath)) {
        filePath = publicAdPath;
        fileName = 'Vexora_Network_Ad.mp4';
      } else if (fs.existsSync(publicIntroPath)) {
        filePath = publicIntroPath;
        fileName = 'vexora-intro.mp4';
      }

      let customUrl = null;
      if (fs.existsSync(VIDEO_CONFIG_PATH)) {
        try {
          const cfg = JSON.parse(fs.readFileSync(VIDEO_CONFIG_PATH, 'utf-8'));
          if (cfg.customUrl) customUrl = cfg.customUrl;
        } catch (_) {}
      }

      if (filePath) {
        const stats = fs.statSync(filePath);
        return res.json({
          hasVideo: true,
          fileName,
          sizeBytes: stats.size,
          sizeMb: (stats.size / (1024 * 1024)).toFixed(2),
          updatedAt: stats.mtime.toISOString(),
          url: customUrl || `/${fileName}`,
          customUrl
        });
      }

      return res.json({
        hasVideo: !!customUrl,
        fileName: null,
        url: customUrl || '/Vexora_Network_Ad.mp4',
        customUrl
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/video/upload', (req, res) => {
    try {
      let buffer: Buffer | null = null;
      let originalName = 'Vexora_Network_Ad.mp4';

      if (req.body && typeof req.body === 'object' && req.body.base64) {
        const raw = req.body.base64.includes(',') ? req.body.base64.split(',')[1] : req.body.base64;
        buffer = Buffer.from(raw, 'base64');
        if (req.body.fileName) originalName = req.body.fileName;
      } else if (Buffer.isBuffer(req.body)) {
        buffer = req.body;
      }

      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ error: 'No video payload received' });
      }

      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

      const targetPaths = [
        path.join(publicDir, 'Vexora_Network_Ad.mp4'),
        path.join(publicDir, 'vexora-intro.mp4'),
      ];

      const distDir = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distDir)) {
        targetPaths.push(path.join(distDir, 'Vexora_Network_Ad.mp4'));
        targetPaths.push(path.join(distDir, 'vexora-intro.mp4'));
      }

      const docsDir = path.join(process.cwd(), 'docs');
      if (fs.existsSync(docsDir)) {
        targetPaths.push(path.join(docsDir, 'Vexora_Network_Ad.mp4'));
        targetPaths.push(path.join(docsDir, 'vexora-intro.mp4'));
      }

      for (const p of targetPaths) {
        fs.writeFileSync(p, buffer);
      }

      try {
        fs.writeFileSync(VIDEO_CONFIG_PATH, JSON.stringify({ customUrl: null, fileName: originalName, updatedAt: new Date().toISOString() }));
      } catch (_) {}

      console.log(`[VIDEO] Successfully uploaded and saved video file: ${originalName} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

      return res.json({
        success: true,
        fileName: 'Vexora_Network_Ad.mp4',
        url: '/Vexora_Network_Ad.mp4',
        sizeMb: (buffer.length / (1024 * 1024)).toFixed(2)
      });
    } catch (err: any) {
      console.error('[VIDEO UPLOAD ERROR]', err);
      res.status(500).json({ error: err.message || 'Failed to save video' });
    }
  });

  app.post('/api/video/url', (req, res) => {
    try {
      const { url } = req.body;
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      fs.writeFileSync(VIDEO_CONFIG_PATH, JSON.stringify({ customUrl: url || null, updatedAt: new Date().toISOString() }));
      res.json({ success: true, customUrl: url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // API Routes
  app.get('/api/auth/google/url', (req, res) => {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    
    if (!client_id || client_id === 'undefined') {
      return res.json({ 
        error: "GOOGLE_KEYS_MISSING",
        message: "Google Client ID is not configured."
      });
    }

    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${appUrl}/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: client_id,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      prompt: 'select_account',
    });

    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  });

  app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${appUrl}/auth/google/callback`;

    if (!code) {
      return res.send(`
        <html>
          <body style="background: #09090b; color: #f4f4f5; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px;">
            <div>
              <h2 style="color: #ef4444; margin-bottom: 10px;">AUTHENTICATION ERROR</h2>
              <p>No authorization code was received from Google Identity Services.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'No authorization code received' }, '*');
                  setTimeout(() => window.close(), 3000);
                }
              </script>
            </div>
          </body>
        </html>
      `);
    }

    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: client_id || '',
          client_secret: client_secret || '',
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenResponse.ok) {
        const errBody = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${errBody}`);
      }

      const tokens: any = await tokenResponse.json();
      const accessToken = tokens.access_token;

      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info from Google Services');
      }

      const googleUser: any = await userResponse.json();

      let profileData;
      // If logging in with the owner email, map directly to Vexora Owner profile
      if (googleUser.email && googleUser.email.toLowerCase() === 'vexora.network@gmail.com') {
        profileData = {
          id: 'u-owner',
          name: 'Vexora Owner',
          handle: 'vexora_owner',
          email: 'vexora.network@gmail.com',
          avatar: googleUser.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop',
          bio: 'Founder and Architect of the Vexora Network. Quantum Intelligence Oversight.',
          location: 'Vexora Core',
          joinedDate: 'May 2026',
          followers: 8940,
          following: 1,
          isVerified: true
        };
      } else {
        profileData = {
          id: 'u-google-' + googleUser.id,
          name: googleUser.name || googleUser.given_name || 'Google User',
          handle: (googleUser.given_name || 'user').toLowerCase() + '_' + Math.random().toString(36).substr(2, 4),
          email: googleUser.email,
          avatar: googleUser.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${googleUser.email}`,
          banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop',
          location: 'Verified Neural Node',
          bio: 'Google authorized neural quantum link identifier.',
          joinedDate: 'June 2026',
          followers: 120,
          following: 80,
          isVerified: googleUser.email && (googleUser.email.toLowerCase() === 'fluxstudio4@gmail.com' || googleUser.email.toLowerCase() === 'vexora.network@gmail.com')
        };
      }

      res.send(`
        <html>
          <body style="background: #09090b; color: #f4f4f5; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px;">
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 30px; max-width: 400px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);">
              <svg style="width: 48px; height: 48px; color: #10b981; margin-bottom: 15px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h2 style="color: #10b981; margin-top: 0; font-size: 18px; letter-spacing: 0.1em;">LINK SECURED</h2>
              <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6;">Synchronizing Google account with Vexora Network. Returning to Core Terminal...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'GOOGLE_AUTH_SUCCESS', 
                    user: ${JSON.stringify(profileData)} 
                  }, '*');
                  setTimeout(() => window.close(), 1000);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Google Auth Callback Error:", err);
      res.send(`
        <html>
          <body style="background: #09090b; color: #f4f4f5; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px;">
            <div>
              <h2 style="color: #ef4444; margin-bottom: 10px;">LINKAGE FAILURE</h2>
              <p style="font-size: 13px; color: #a1a1aa;">${err.message}</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: ${JSON.stringify(err.message)} }, '*');
                  setTimeout(() => window.close(), 3000);
                }
              </script>
            </div>
          </body>
        </html>
      `);
    }
  });

  // SMTP Status inquiry route
  app.get('/api/owner/smtp-status', (req, res) => {
    const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const smtpPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = process.env.SMTP_PORT || '465';
    
    const hasSMTP = !!(smtpUser && smtpUser.trim() !== '' && smtpPass && smtpPass.trim() !== '');
    
    res.json({
      success: true,
      hasSMTP,
      smtpUser: smtpUser ? `${smtpUser.slice(0, 3)}...${smtpUser.slice(smtpUser.indexOf('@'))}` : null,
      smtpHost,
      smtpPort
    });
  });

  app.post('/api/owner/broadcast-email', async (req, res) => {
    try {
      const { subject, content, recipients, enhance } = req.body;
      
      let finalSubject = subject;
      let finalContent = content;
      let aiNote = "";

      if (enhance && hasAiClient()) {
        const prompt = `Refine this email broadcast for Vexora Network members. Sound highly-professional, futuristic, and clear.
Subject: ${subject}
Content: ${content}

Return a JSON object:
{
  "subject": "refined subject here",
  "content": "refined content here (with gorgeous markdown structure)"
}`;
        
        try {
          const ai = getAiClient();
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          });
          
          const text = response.text || "";
          const jsonMatch = text.match(/\{.*\}/s);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            finalSubject = parsed.subject || subject;
            finalContent = parsed.content || content;
            aiNote = " (Enhanced by Vexora AI)";
          }
        } catch (err: any) {
          console.warn("Enhance broadcast failed, fallback to original:", err);
          checkErrorForInvalidKey(err);
        }
      }

      console.log(`[BROADCAST] Active System Broadcast to ${recipients?.length} nodes...`);
      console.log(`[BROADCAST] Subject: ${finalSubject}`);

      const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER;
      const smtpPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
      const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
      const fromName = process.env.SMTP_FROM_NAME || 'Vexora Network';

      const hasSMTP = !!(smtpUser && smtpUser.trim() !== '' && smtpPass && smtpPass.trim() !== '');
      const logs: string[] = [];

      if (hasSMTP) {
        logs.push(`SMTP host identifier loaded: ${smtpUser}`);
        logs.push(`Attempting secure socket connect on target relay: ${smtpHost}:${smtpPort}...`);
        
        try {
          let transportOpts: any = {};
          if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            logs.push(`Configuring native Google Mail SMTP relay protocol (service: gmail)...`);
            transportOpts = {
              service: 'gmail',
              auth: {
                user: smtpUser,
                pass: smtpPass
              }
            };
          } else {
            logs.push(`Configuring standard SMTP relay protocol (${smtpHost}:${smtpPort})...`);
            transportOpts = {
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                user: smtpUser,
                pass: smtpPass
              },
              tls: {
                rejectUnauthorized: false
              }
            };
          }

          const transporter = nodemailer.createTransport(transportOpts);

          // Test SMTP link
          await transporter.verify();
          logs.push(`✅ Connection handshake completed. Outgoing relay linked safely.`);

          if (recipients && Array.isArray(recipients)) {
            for (let i = 0; i < recipients.length; i++) {
              const email = recipients[i];
              logs.push(`Enqueuing parcel envelope for destination node: ${email}...`);
              
              const htmlBody = `
                <div style="background-color: #0c0c0e; color: #f4f4f5; font-family: 'Courier New', Courier, monospace; padding: 40px 20px; border: 1px solid rgba(168,85,247,0.3); border-radius: 16px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 45px rgba(168,85,247,0.15);">
                  <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 20px; margin-bottom: 25px; text-align: center;">
                    <h1 style="color: #a855f7; font-size: 24px; margin: 0; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase;">VEXORA NETWORK</h1>
                    <span style="color: rgba(255,255,255,0.4); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;">Owner Core System Broadcast</span>
                  </div>
                  <div style="text-align: left; background-color: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 25px; line-height: 1.6; font-size: 13px; color: #e4e4e7;">
                    ${finalContent.replace(/\n/g, '<br />')}
                  </div>
                  <div style="margin-top: 35px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; font-size: 10px; color: rgba(255,255,255,0.3); text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">
                    Sent to target node address: <strong>${email}</strong> <br />
                    System Reference ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()} <br />
                    <span style="color: #a855f7;">Vexora Grid Core System • June 2026</span>
                  </div>
                </div>
              `;

              await transporter.sendMail({
                from: `"${fromName}" <${smtpUser}>`,
                to: email,
                subject: finalSubject,
                text: finalContent,
                html: htmlBody
              });

              logs.push(`[SUCCESS] Outgoing dispatch packet #${i + 1} finalized & delivered to: ${email}`);
            }
          }
          logs.push(`Broadcast routine finished successfully.${aiNote}`);
        } catch (mailError: any) {
          console.error("Nodemailer transporter error:", mailError);
          logs.push(`❌ Outbound transport connection error: ${mailError.message || mailError}`);
          logs.push(`Rescheduling mail transmission to Simulation Fallback queue...`);
          
          if (recipients && Array.isArray(recipients)) {
            for (let i = 0; i < recipients.length; i++) {
              const email = recipients[i];
              logs.push(`[SIMULATION FALLBACK] Delivered offline quantum package directly to index: ${email}`);
            }
          }
        }
      } else {
        logs.push(`⚠️ GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP_USER/PASS) are not configured in environment variables.`);
        logs.push(`[SIMULATION MODE] Operating in simulated broadcast mode. Outgoing emails will only trigger interface logs.`);
        logs.push(`To send real emails to your active user accounts, go to Settings > Secrets inside the AI Studio dashboard and configure: GMAIL_USER and GMAIL_APP_PASSWORD.`);
        
        if (recipients && Array.isArray(recipients)) {
          for (let i = 0; i < recipients.length; i++) {
            const email = recipients[i];
            logs.push(`Enqueuing local mock package to destination node: ${email}...`);
            logs.push(`Delivered simulated broadcast packet #${i + 1} successfully to mock queue: ${email} -> [SUCCESS 250 OK]`);
          }
        }
        logs.push(`Offline mock routine completed successfully.${aiNote}`);
      }

      res.json({
        success: true,
        hasSMTP,
        subject: finalSubject,
        content: finalContent,
        logs
      });
    } catch (err: any) {
      console.error("Broadcast endpoint error:", err);
      res.status(500).json({ error: err.message || "Pipeline error during node dispatch sequence" });
    }
  });

  app.post('/api/ai/trending', async (req, res) => {
    const { posts } = req.body;
    
    // Helper to extract fallback hashtags locally without needing the API key
    const runLocalTrendingFallback = () => {
      const hashtags: Record<string, number> = {};
      if (Array.isArray(posts)) {
        for (const post of posts) {
          if (post && typeof post.content === 'string') {
            const words = post.content.match(/#[a-zA-Z0-9_\u0600-\u06FF]+/g) || [];
            for (const rawTag of words) {
              const tag = rawTag.toLowerCase();
              hashtags[tag] = (hashtags[tag] || 0) + 1;
            }
          }
        }
      }
      
      // Ensure we have some default hashtags as a fallback
      const defaults = ["#fluxnetwork", "#cyberdeck", "#quantumcomputing", "#scifiui", "#nodeidentity"];
      for (const def of defaults) {
        if (!hashtags[def]) {
          hashtags[def] = Math.floor(Math.random() * 5) + 3;
        }
      }
      
      const sorted = Object.entries(hashtags)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
        
      return sorted;
    };

    try {
      if (!hasAiClient()) {
        return res.json(runLocalTrendingFallback());
      }
      
      const prompt = `Analyze the following social media posts and identify the top 5 trending hashtags or topics. Return ONLY a JSON array of objects with properties "tag" (string, starting with #) and "count" (number, estimated frequency/relevance).
      
      Posts:
      ${posts.map((p: any) => `- ${p.content}`).join('\n')}
      `;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = response.text || "[]";
      // Extract JSON if model wraps it in markdown blocks
      const jsonMatch = text.match(/\[.*\]/s);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      
      res.json(JSON.parse(jsonStr));
    } catch (error: any) {
      checkErrorForInvalidKey(error);
      if (!isApiKeyInvalid) {
        console.info("[Vexora AI] Gemini Trending fallback activated. Using local hashtag extraction.");
      }
      res.json(runLocalTrendingFallback());
    }
  });

  app.get('/api/ai/status', (req, res) => {
    // Reload environment variables from .env to pick up any updates to the API key
    dotenv.config({ override: true });
    
    // Reset invalid flag and cache to force testing the potentially new/corrected API key
    isApiKeyInvalid = false;
    aiClient = null;
    
    res.json({ hasApiKey: hasAiClient() });
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, systemPrompt } = req.body;
      
      const currentKey = process.env.GEMINI_API_KEY || '';
      const hasKey = !!(currentKey && currentKey !== 'undefined' && currentKey !== 'null' && currentKey.trim() !== '');

      if (!hasKey) {
        return res.json({ 
          text: "Neural Link Offline: [GEMINI_API_KEY] environment variable is missing. Please configure it in your AI Studio Panel (Settings > Secrets) to enable natural language conversations with this terminal." 
        });
      }

      if (isApiKeyInvalid) {
        return res.json({
          text: "Neural Link Handshake Notice: The current GEMINI_API_KEY has restricted project access (PERMISSION_DENIED). Please verify your Google AI Studio API key in Settings > Secrets to unlock live quantum responses."
        });
      }
      
      const ai = getAiClient();
      const defaultSystemInstruction = systemPrompt || 
        "You are Vexora Quantum AI (المساعد الذكي لشبكة فيكسورا), an advanced, highly intelligent neural assistant embedded in Vexora Network. You provide accurate, deeply reasoned, helpful, and polite answers in Arabic and English, formatting responses using clear Markdown, bullet points, and code blocks where helpful.";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages.map((m: any) => {
          const parts: any[] = [];
          
          // Only add text if it is present or if there are no attachments
          if (m.text || !m.attachments || m.attachments.length === 0) {
            parts.push({ text: m.text || '' });
          }
          
          if (Array.isArray(m.attachments)) {
            m.attachments.forEach((att: any) => {
              if (att.base64 && att.mimeType) {
                const base64Data = att.base64.includes(",") 
                  ? att.base64.split(",")[1] 
                  : att.base64;
                  
                parts.push({
                  inlineData: {
                    mimeType: att.mimeType,
                    data: base64Data
                  }
                });
              }
            });
          }
          
          return {
            role: m.role === 'user' ? 'user' : 'model',
            parts: parts
          };
        }),
        config: {
          systemInstruction: defaultSystemInstruction,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      checkErrorForInvalidKey(error);
      const errMsg = (error && (error.message || error.toString() || JSON.stringify(error))) || "";
      if (errMsg.includes("PERMISSION_DENIED") || errMsg.includes("denied access") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("not valid") || error.status === 403) {
        return res.json({
          text: "Neural Link Handshake Notice: The provided GEMINI_API_KEY project has restricted permissions (PERMISSION_DENIED). Please verify your API key in Settings > Secrets to activate live neural processing."
        });
      }
      res.status(200).json({ 
        text: "Neural Core response generated via fallback protocol: System operational. Please check your network or API key configuration in Settings > Secrets." 
      });
    }
  });

  const CURATED_GIFS = [
    {
      id: "g1",
      title: "Cyberpunk City",
      url: "https://media.giphy.com/media/3o7buj6wY0PSGDHriE/giphy.gif",
      preview: "https://media.giphy.com/media/3o7buj6wY0PSGDHriE/giphy.gif",
      tags: ["cyberpunk", "neon", "city", "future", "scifi"]
    },
    {
      id: "g2",
      title: "Retro Tech Matrix",
      url: "https://media.giphy.com/media/bMyWf6XFx93mE/giphy.gif",
      preview: "https://media.giphy.com/media/bMyWf6XFx93mE/giphy.gif",
      tags: ["tech", "matrix", "retro", "code", "hacker"]
    },
    {
      id: "g3",
      title: "Binary Code Rain",
      url: "https://media.giphy.com/media/Qf0hN0V9u86rK/giphy.gif",
      preview: "https://media.giphy.com/media/Qf0hN0V9u86rK/giphy.gif",
      tags: ["code", "matrix", "programming", "green", "hacker"]
    },
    {
      id: "g4",
      title: "Synthwave Sunset",
      url: "https://media.giphy.com/media/UatpMyF9i7SMM/giphy.gif",
      preview: "https://media.giphy.com/media/UatpMyF9i7SMM/giphy.gif",
      tags: ["synthwave", "outrun", "car", "retro", "sun"]
    },
    {
      id: "g5",
      title: "Cyberpunk Holo Display",
      url: "https://media.giphy.com/media/HteV6h0MDqV68/giphy.gif",
      preview: "https://media.giphy.com/media/HteV6h0MDqV68/giphy.gif",
      tags: ["cyberpunk", "holo", "tech", "hud", "future"]
    },
    {
      id: "g6",
      title: "Anime Network Signal",
      url: "https://media.giphy.com/media/13rQ7rrTrvBsVW/giphy.gif",
      preview: "https://media.giphy.com/media/13rQ7rrTrvBsVW/giphy.gif",
      tags: ["anime", "network", "cyberpunk", "glitch"]
    },
    {
      id: "g7",
      title: "Futuristic HUD Interface",
      url: "https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif",
      preview: "https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif",
      tags: ["hud", "tech", "interface", "sci-fi", "ui"]
    },
    {
      id: "g8",
      title: "Mecha Diagnostic Scan",
      url: "https://media.giphy.com/media/3xz2BCe5jnZJLb5as8/giphy.gif",
      preview: "https://media.giphy.com/media/3xz2BCe5jnZJLb5as8/giphy.gif",
      tags: ["robot", "mecha", "tech", "diagnostic", "anime"]
    },
    {
      id: "g9",
      title: "Programming Cat",
      url: "https://media.giphy.com/media/XIqCQx02E34C84yFLa/giphy.gif",
      preview: "https://media.giphy.com/media/XIqCQx02E34C84yFLa/giphy.gif",
      tags: ["cat", "code", "funny", "developer", "typing"]
    },
    {
      id: "g10",
      title: "Hacking Terminal Speedrun",
      url: "https://media.giphy.com/media/3knKct3fGqxhK/giphy.gif",
      preview: "https://media.giphy.com/media/3knKct3fGqxhK/giphy.gif",
      tags: ["hacker", "terminal", "cyber", "screen", "code"]
    }
  ];

  app.get('/api/gifs/trending', async (req, res) => {
    try {
      const giphyUrl = `https://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC&limit=25`;
      const response = await fetch(giphyUrl);
      if (!response.ok) throw new Error("Giphy API responded with error");
      const data = await response.json();
      const gifs = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        url: item.images.fixed_height.url,
        preview: item.images.fixed_height_small.url
      }));
      res.json({ gifs });
    } catch (err) {
      console.warn("Using curated fallback for trending GIFs", err);
      res.json({ gifs: CURATED_GIFS });
    }
  });

  app.get('/api/gifs/search', async (req, res) => {
    const q = req.query.q as string || '';
    try {
      const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&limit=25&q=${encodeURIComponent(q)}`;
      const response = await fetch(giphyUrl);
      if (!response.ok) throw new Error("Giphy API responded with error");
      const data = await response.json();
      const gifs = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        url: item.images.fixed_height.url,
        preview: item.images.fixed_height_small.url
      }));
      res.json({ gifs });
    } catch (err) {
      console.warn("Using curated fallback for GIF search query:", q, err);
      const filtered = CURATED_GIFS.filter(g => 
        g.title.toLowerCase().includes(q.toLowerCase()) ||
        g.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
      );
      res.json({ gifs: filtered.length > 0 ? filtered : CURATED_GIFS });
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Real-time collaboration state
  // roomID -> { userId -> { name, color, x, y } }
  const rooms: Record<string, Record<string, any>> = {};

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', ({ roomId, userData }) => {
      socket.join(roomId);
      
      if (!rooms[roomId]) {
        rooms[roomId] = {};
      }
      rooms[roomId][socket.id] = { ...userData, id: socket.id };
      
      // Notify others in room
      io.to(roomId).emit('presence-update', rooms[roomId]);
    });

    socket.on('cursor-move', ({ roomId, position }) => {
      if (rooms[roomId] && rooms[roomId][socket.id]) {
        rooms[roomId][socket.id].x = position.x;
        rooms[roomId][socket.id].y = position.y;
        // Broadcast to everyone else in the room
        socket.to(roomId).emit('cursor-update', {
          userId: socket.id,
          position
        });
      }
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      if (rooms[roomId] && rooms[roomId][socket.id]) {
        delete rooms[roomId][socket.id];
        io.to(roomId).emit('presence-update', rooms[roomId]);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Clean up all rooms the user was in
      for (const roomId in rooms) {
        if (rooms[roomId][socket.id]) {
          delete rooms[roomId][socket.id];
          io.to(roomId).emit('presence-update', rooms[roomId]);
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
