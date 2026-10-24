var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_http = require("http");
var import_socket = require("socket.io");
var import_vite = require("vite");
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_meta = {};
import_dotenv.default.config();
var __filename = typeof import_meta !== "undefined" && import_meta.url ? (0, import_url.fileURLToPath)(import_meta.url) : "";
var __dirname = __filename ? import_path.default.dirname(__filename) : "";
var aiClient = null;
var isApiKeyInvalid = false;
var lastCheckedKey = void 0;
function hasAiClient() {
  const currentKey = process.env.GEMINI_API_KEY || "";
  if (currentKey !== lastCheckedKey) {
    isApiKeyInvalid = false;
    aiClient = null;
    lastCheckedKey = currentKey;
  }
  if (isApiKeyInvalid) {
    return false;
  }
  return !!(currentKey && currentKey !== "undefined" && currentKey !== "null" && currentKey.trim() !== "");
}
function checkErrorForInvalidKey(error) {
  const errMsg = error && (error.message || error.toString() || JSON.stringify(error)) || "";
  if (errMsg.includes("PERMISSION_DENIED") || errMsg.includes("denied access") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("not valid") || errMsg.includes("SERVICE_DISABLED") || errMsg.includes("BILLING_DISABLED") || error && error.status === 403) {
    isApiKeyInvalid = true;
    console.warn("\u26A0\uFE0F [GEMINI] API key or project access restricted (PERMISSION_DENIED/403). Using graceful fallback.");
  }
}
function getAiClient() {
  const currentKey = process.env.GEMINI_API_KEY || "";
  if (currentKey !== lastCheckedKey) {
    isApiKeyInvalid = false;
    aiClient = null;
    lastCheckedKey = currentKey;
  }
  if (!aiClient) {
    const key = currentKey;
    if (!key || key === "undefined" || key === "null" || key.trim() === "") {
      throw new Error("GEMINI_API_KEY environment variable is missing or empty. Please set your Gemini API key in Settings > Secrets in the AI Studio panel.");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "150mb" }));
  app.use(import_express.default.raw({ type: ["video/*", "application/octet-stream"], limit: "300mb" }));
  const httpServer = (0, import_http.createServer)(app);
  const VIDEO_CONFIG_PATH = import_path.default.join(process.cwd(), "public", "video-config.json");
  app.get("/api/video/info", (req, res) => {
    try {
      const publicAdPath = import_path.default.join(process.cwd(), "public", "Vexora_Network_Ad.mp4");
      const publicIntroPath = import_path.default.join(process.cwd(), "public", "vexora-intro.mp4");
      let filePath = "";
      let fileName = "";
      if (import_fs.default.existsSync(publicAdPath)) {
        filePath = publicAdPath;
        fileName = "Vexora_Network_Ad.mp4";
      } else if (import_fs.default.existsSync(publicIntroPath)) {
        filePath = publicIntroPath;
        fileName = "vexora-intro.mp4";
      }
      let customUrl = null;
      if (import_fs.default.existsSync(VIDEO_CONFIG_PATH)) {
        try {
          const cfg = JSON.parse(import_fs.default.readFileSync(VIDEO_CONFIG_PATH, "utf-8"));
          if (cfg.customUrl) customUrl = cfg.customUrl;
        } catch (_) {
        }
      }
      if (filePath) {
        const stats = import_fs.default.statSync(filePath);
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
        url: customUrl || "/Vexora_Network_Ad.mp4",
        customUrl
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/video/upload", (req, res) => {
    try {
      let buffer = null;
      let originalName = "Vexora_Network_Ad.mp4";
      if (req.body && typeof req.body === "object" && req.body.base64) {
        const raw = req.body.base64.includes(",") ? req.body.base64.split(",")[1] : req.body.base64;
        buffer = Buffer.from(raw, "base64");
        if (req.body.fileName) originalName = req.body.fileName;
      } else if (Buffer.isBuffer(req.body)) {
        buffer = req.body;
      }
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ error: "No video payload received" });
      }
      const publicDir = import_path.default.join(process.cwd(), "public");
      if (!import_fs.default.existsSync(publicDir)) import_fs.default.mkdirSync(publicDir, { recursive: true });
      const targetPaths = [
        import_path.default.join(publicDir, "Vexora_Network_Ad.mp4"),
        import_path.default.join(publicDir, "vexora-intro.mp4")
      ];
      const distDir = import_path.default.join(process.cwd(), "dist");
      if (import_fs.default.existsSync(distDir)) {
        targetPaths.push(import_path.default.join(distDir, "Vexora_Network_Ad.mp4"));
        targetPaths.push(import_path.default.join(distDir, "vexora-intro.mp4"));
      }
      const docsDir = import_path.default.join(process.cwd(), "docs");
      if (import_fs.default.existsSync(docsDir)) {
        targetPaths.push(import_path.default.join(docsDir, "Vexora_Network_Ad.mp4"));
        targetPaths.push(import_path.default.join(docsDir, "vexora-intro.mp4"));
      }
      for (const p of targetPaths) {
        import_fs.default.writeFileSync(p, buffer);
      }
      try {
        import_fs.default.writeFileSync(VIDEO_CONFIG_PATH, JSON.stringify({ customUrl: null, fileName: originalName, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }));
      } catch (_) {
      }
      console.log(`[VIDEO] Successfully uploaded and saved video file: ${originalName} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
      return res.json({
        success: true,
        fileName: "Vexora_Network_Ad.mp4",
        url: "/Vexora_Network_Ad.mp4",
        sizeMb: (buffer.length / (1024 * 1024)).toFixed(2)
      });
    } catch (err) {
      console.error("[VIDEO UPLOAD ERROR]", err);
      res.status(500).json({ error: err.message || "Failed to save video" });
    }
  });
  app.post("/api/video/url", (req, res) => {
    try {
      const { url } = req.body;
      const publicDir = import_path.default.join(process.cwd(), "public");
      if (!import_fs.default.existsSync(publicDir)) import_fs.default.mkdirSync(publicDir, { recursive: true });
      import_fs.default.writeFileSync(VIDEO_CONFIG_PATH, JSON.stringify({ customUrl: url || null, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }));
      res.json({ success: true, customUrl: url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/auth/google/url", (req, res) => {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    if (!client_id || client_id === "undefined") {
      return res.json({
        error: "GOOGLE_KEYS_MISSING",
        message: "Google Client ID is not configured."
      });
    }
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${appUrl}/auth/google/callback`;
    const params = new URLSearchParams({
      client_id,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      prompt: "select_account"
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  });
  app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
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
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: client_id || "",
          client_secret: client_secret || "",
          redirect_uri: redirectUri,
          grant_type: "authorization_code"
        })
      });
      if (!tokenResponse.ok) {
        const errBody = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${errBody}`);
      }
      const tokens = await tokenResponse.json();
      const accessToken = tokens.access_token;
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user info from Google Services");
      }
      const googleUser = await userResponse.json();
      let profileData;
      if (googleUser.email && googleUser.email.toLowerCase() === "vexora.network@gmail.com") {
        profileData = {
          id: "u-owner",
          name: "Vexora Owner",
          handle: "vexora_owner",
          email: "vexora.network@gmail.com",
          avatar: googleUser.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
          bio: "Founder and Architect of the Vexora Network. Quantum Intelligence Oversight.",
          location: "Vexora Core",
          joinedDate: "May 2026",
          followers: 8940,
          following: 1,
          isVerified: true
        };
      } else {
        profileData = {
          id: "u-google-" + googleUser.id,
          name: googleUser.name || googleUser.given_name || "Google User",
          handle: (googleUser.given_name || "user").toLowerCase() + "_" + Math.random().toString(36).substr(2, 4),
          email: googleUser.email,
          avatar: googleUser.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${googleUser.email}`,
          banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
          location: "Verified Neural Node",
          bio: "Google authorized neural quantum link identifier.",
          joinedDate: "June 2026",
          followers: 120,
          following: 80,
          isVerified: googleUser.email && (googleUser.email.toLowerCase() === "fluxstudio4@gmail.com" || googleUser.email.toLowerCase() === "vexora.network@gmail.com")
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
    } catch (err) {
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
  app.get("/api/owner/smtp-status", (req, res) => {
    const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const smtpPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = process.env.SMTP_PORT || "465";
    const hasSMTP = !!(smtpUser && smtpUser.trim() !== "" && smtpPass && smtpPass.trim() !== "");
    res.json({
      success: true,
      hasSMTP,
      smtpUser: smtpUser ? `${smtpUser.slice(0, 3)}...${smtpUser.slice(smtpUser.indexOf("@"))}` : null,
      smtpHost,
      smtpPort
    });
  });
  app.post("/api/owner/broadcast-email", async (req, res) => {
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
            contents: [{ role: "user", parts: [{ text: prompt }] }]
          });
          const text = response.text || "";
          const jsonMatch = text.match(/\{.*\}/s);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            finalSubject = parsed.subject || subject;
            finalContent = parsed.content || content;
            aiNote = " (Enhanced by Vexora AI)";
          }
        } catch (err) {
          console.warn("Enhance broadcast failed, fallback to original:", err);
          checkErrorForInvalidKey(err);
        }
      }
      console.log(`[BROADCAST] Active System Broadcast to ${recipients?.length} nodes...`);
      console.log(`[BROADCAST] Subject: ${finalSubject}`);
      const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER;
      const smtpPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
      const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
      const fromName = process.env.SMTP_FROM_NAME || "Vexora Network";
      const hasSMTP = !!(smtpUser && smtpUser.trim() !== "" && smtpPass && smtpPass.trim() !== "");
      const logs = [];
      if (hasSMTP) {
        logs.push(`SMTP host identifier loaded: ${smtpUser}`);
        logs.push(`Attempting secure socket connect on target relay: ${smtpHost}:${smtpPort}...`);
        try {
          let transportOpts = {};
          if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            logs.push(`Configuring native Google Mail SMTP relay protocol (service: gmail)...`);
            transportOpts = {
              service: "gmail",
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
          const transporter = import_nodemailer.default.createTransport(transportOpts);
          await transporter.verify();
          logs.push(`\u2705 Connection handshake completed. Outgoing relay linked safely.`);
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
                    ${finalContent.replace(/\n/g, "<br />")}
                  </div>
                  <div style="margin-top: 35px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; font-size: 10px; color: rgba(255,255,255,0.3); text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">
                    Sent to target node address: <strong>${email}</strong> <br />
                    System Reference ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()} <br />
                    <span style="color: #a855f7;">Vexora Grid Core System \u2022 June 2026</span>
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
        } catch (mailError) {
          console.error("Nodemailer transporter error:", mailError);
          logs.push(`\u274C Outbound transport connection error: ${mailError.message || mailError}`);
          logs.push(`Rescheduling mail transmission to Simulation Fallback queue...`);
          if (recipients && Array.isArray(recipients)) {
            for (let i = 0; i < recipients.length; i++) {
              const email = recipients[i];
              logs.push(`[SIMULATION FALLBACK] Delivered offline quantum package directly to index: ${email}`);
            }
          }
        }
      } else {
        logs.push(`\u26A0\uFE0F GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP_USER/PASS) are not configured in environment variables.`);
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
    } catch (err) {
      console.error("Broadcast endpoint error:", err);
      res.status(500).json({ error: err.message || "Pipeline error during node dispatch sequence" });
    }
  });
  app.post("/api/ai/trending", async (req, res) => {
    const { posts } = req.body;
    const runLocalTrendingFallback = () => {
      const hashtags = {};
      if (Array.isArray(posts)) {
        for (const post of posts) {
          if (post && typeof post.content === "string") {
            const words = post.content.match(/#[a-zA-Z0-9_\u0600-\u06FF]+/g) || [];
            for (const rawTag of words) {
              const tag = rawTag.toLowerCase();
              hashtags[tag] = (hashtags[tag] || 0) + 1;
            }
          }
        }
      }
      const defaults = ["#fluxnetwork", "#cyberdeck", "#quantumcomputing", "#scifiui", "#nodeidentity"];
      for (const def of defaults) {
        if (!hashtags[def]) {
          hashtags[def] = Math.floor(Math.random() * 5) + 3;
        }
      }
      const sorted = Object.entries(hashtags).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 5);
      return sorted;
    };
    try {
      if (!hasAiClient()) {
        return res.json(runLocalTrendingFallback());
      }
      const prompt = `Analyze the following social media posts and identify the top 5 trending hashtags or topics. Return ONLY a JSON array of objects with properties "tag" (string, starting with #) and "count" (number, estimated frequency/relevance).
      
      Posts:
      ${posts.map((p) => `- ${p.content}`).join("\n")}
      `;
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      const text = response.text || "[]";
      const jsonMatch = text.match(/\[.*\]/s);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      res.json(JSON.parse(jsonStr));
    } catch (error) {
      checkErrorForInvalidKey(error);
      if (!isApiKeyInvalid) {
        console.info("[Vexora AI] Gemini Trending fallback activated. Using local hashtag extraction.");
      }
      res.json(runLocalTrendingFallback());
    }
  });
  app.get("/api/ai/status", (req, res) => {
    import_dotenv.default.config({ override: true });
    isApiKeyInvalid = false;
    aiClient = null;
    res.json({ hasApiKey: hasAiClient() });
  });
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, systemPrompt } = req.body;
      const currentKey = process.env.GEMINI_API_KEY || "";
      const hasKey = !!(currentKey && currentKey !== "undefined" && currentKey !== "null" && currentKey.trim() !== "");
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
      const defaultSystemInstruction = systemPrompt || "You are Vexora Quantum AI (\u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A \u0644\u0634\u0628\u0643\u0629 \u0641\u064A\u0643\u0633\u0648\u0631\u0627), an advanced, highly intelligent neural assistant embedded in Vexora Network. You provide accurate, deeply reasoned, helpful, and polite answers in Arabic and English, formatting responses using clear Markdown, bullet points, and code blocks where helpful.";
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages.map((m) => {
          const parts = [];
          if (m.text || !m.attachments || m.attachments.length === 0) {
            parts.push({ text: m.text || "" });
          }
          if (Array.isArray(m.attachments)) {
            m.attachments.forEach((att) => {
              if (att.base64 && att.mimeType) {
                const base64Data = att.base64.includes(",") ? att.base64.split(",")[1] : att.base64;
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
            role: m.role === "user" ? "user" : "model",
            parts
          };
        }),
        config: {
          systemInstruction: defaultSystemInstruction
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      checkErrorForInvalidKey(error);
      const errMsg = error && (error.message || error.toString() || JSON.stringify(error)) || "";
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
  app.get("/api/gifs/trending", async (req, res) => {
    try {
      const giphyUrl = `https://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC&limit=25`;
      const response = await fetch(giphyUrl);
      if (!response.ok) throw new Error("Giphy API responded with error");
      const data = await response.json();
      const gifs = data.data.map((item) => ({
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
  app.get("/api/gifs/search", async (req, res) => {
    const q = req.query.q || "";
    try {
      const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&limit=25&q=${encodeURIComponent(q)}`;
      const response = await fetch(giphyUrl);
      if (!response.ok) throw new Error("Giphy API responded with error");
      const data = await response.json();
      const gifs = data.data.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.images.fixed_height.url,
        preview: item.images.fixed_height_small.url
      }));
      res.json({ gifs });
    } catch (err) {
      console.warn("Using curated fallback for GIF search query:", q, err);
      const filtered = CURATED_GIFS.filter(
        (g) => g.title.toLowerCase().includes(q.toLowerCase()) || g.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
      );
      res.json({ gifs: filtered.length > 0 ? filtered : CURATED_GIFS });
    }
  });
  const io = new import_socket.Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3e3;
  const rooms = {};
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("join-room", ({ roomId, userData }) => {
      socket.join(roomId);
      if (!rooms[roomId]) {
        rooms[roomId] = {};
      }
      rooms[roomId][socket.id] = { ...userData, id: socket.id };
      io.to(roomId).emit("presence-update", rooms[roomId]);
    });
    socket.on("cursor-move", ({ roomId, position }) => {
      if (rooms[roomId] && rooms[roomId][socket.id]) {
        rooms[roomId][socket.id].x = position.x;
        rooms[roomId][socket.id].y = position.y;
        socket.to(roomId).emit("cursor-update", {
          userId: socket.id,
          position
        });
      }
    });
    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      if (rooms[roomId] && rooms[roomId][socket.id]) {
        delete rooms[roomId][socket.id];
        io.to(roomId).emit("presence-update", rooms[roomId]);
      }
    });
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const roomId in rooms) {
        if (rooms[roomId][socket.id]) {
          delete rooms[roomId][socket.id];
          io.to(roomId).emit("presence-update", rooms[roomId]);
        }
      }
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
