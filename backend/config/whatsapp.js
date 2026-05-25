const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const { handleIncomingMessage } = require("../controllers/whatsapp.controller");
const qrcode = require("qrcode-terminal");

let sock = null;

const connectWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  sock = makeWASocket({
    auth: state,
    // احذف printQRInTerminal
  });

  sock.ev.on("creds.update", saveCreds);

  // أضف هذا لعرض QR
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      if (shouldReconnect) connectWhatsApp();
    } else if (connection === "open") {
      console.log("WhatsApp connected ✅");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.key.fromMe && msg.message) {
      await handleIncomingMessage(sock, msg);
    }
  });
};

const getSock = () => sock;

module.exports = { connectWhatsApp, getSock };
