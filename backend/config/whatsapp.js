const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const { handleIncomingMessage } = require("../controllers/whatsapp.controller");

let sock = null;
let latestQR = null;
let isConnected = false;

const connectWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  sock = makeWASocket({
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      latestQR = qr;
      isConnected = false;
      console.log("QR Code ready — open /qr in browser");
    }

    if (connection === "close") {
      isConnected = false;
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log("Connection closed, reconnecting:", shouldReconnect);
      if (shouldReconnect) connectWhatsApp();
    } else if (connection === "open") {
      latestQR = null;
      isConnected = true;
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
const getQR = () => latestQR;
const getIsConnected = () => isConnected;

module.exports = { connectWhatsApp, getSock, getQR, getIsConnected };
