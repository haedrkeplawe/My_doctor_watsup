require("dotenv").config();
const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode");
const connectDB = require("./config/db");
const { connectWhatsApp, getQR, getIsConnected } = require("./config/whatsapp");
const queueRoutes = require("./routes/queue.routes");
const http = require("http");

connectDB();
connectWhatsApp();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL,"https://dkahled.netlify.app"].filter(Boolean),
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api/queue", queueRoutes);

// ── QR Code Page ──
app.get("/qr", async (req, res) => {
  if (getIsConnected()) {
    return res.send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:50px">
        <h1 style="color:green">✅ واتساب متصل بنجاح!</h1>
        <p>البوت شغال ولا تحتاج مسح QR</p>
      </body></html>
    `);
  }

  const qr = getQR();
  if (!qr) {
    return res.send(`
      <html>
        <head><meta http-equiv="refresh" content="3"></head>
        <body style="font-family:sans-serif;text-align:center;padding:50px">
          <h2>⏳ جاري تحميل QR Code...</h2>
          <p>الصفحة ستتحدث تلقائياً</p>
        </body>
      </html>
    `);
  }

  const qrImage = await qrcode.toDataURL(qr);
  res.send(`
    <html>
      <head><meta http-equiv="refresh" content="30"></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px;background:#f0f4f8">
        <h1>📱 مسح QR Code</h1>
        <p>افتح واتساب ← الأجهزة المرتبطة ← ربط جهاز</p>
        <img src="${qrImage}" style="width:300px;height:300px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1)"/>
        <p style="color:gray;font-size:13px">الصفحة تتجدد كل 30 ثانية</p>
      </body>
    </html>
  `);
});

const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 QR Code page: http://localhost:${PORT}/qr`);
});
