const Patient = require("../models/patient");
const Counter = require("../models/counter");

const CLINIC_URL = "https://dkahled.netlify.app";

const getTodayDate = () => new Date().toISOString().split("T")[0];

/* ─────────────────────
Queue Counter
───────────────────── */
const getNextQueueNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { date: getTodayDate() },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return counter.seq;
};

/* ─────────────────────
Main Handler
───────────────────── */
const handleIncomingMessage = async (sock, msg) => {
  try {
    const rawPhone = msg.key.remoteJid;
    const phone = (msg.key.remoteJidAlt || msg.key.remoteJid)
      .split("@")[0]
      .split(":")[0];

    const text = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      ""
    ).trim();

    if (!text) return;

    /* ───── 1. إلغاء الحجز ───── */
    if (/^الغاء\s+\d+$/.test(text)) {
      const queueNumber = parseInt(text.split(" ")[1]);
      const patient = await Patient.findOne({
        phone,
        date: getTodayDate(),
        queueNumber,
        status: { $in: ["waiting", "called"] },
      });
      if (patient) {
        patient.status = "cancelled";
        await patient.save();
        await sock.sendMessage(rawPhone, {
          text: `✅ تم إلغاء دورك رقم *${queueNumber}* بنجاح.`,
        });
      } else {
        await sock.sendMessage(rawPhone, {
          text: `❌ لم يتم العثور على هذا الدور.`,
        });
      }
      return;
    }

    /* ───── 2. مستخدم بمرحلة إدخال الاسم ───── */
    const pendingPatient = await Patient.findOne({
      phone,
      date: getTodayDate(),
      pending: true,
    });
    if (pendingPatient) {
      const name = text;
      const queueNumber = await getNextQueueNumber();
      pendingPatient.name = name;
      pendingPatient.queueNumber = queueNumber;
      pendingPatient.pending = false;
      pendingPatient.status = "waiting";
      await pendingPatient.save();
      await sock.sendMessage(rawPhone, {
        text: `✅ تم تسجيلك يا ${name}!\nرقم دورك: *${queueNumber}*\n\nتابع دورك من هنا:\n${CLINIC_URL}/#/queue/${queueNumber}\n\nلإلغاء الحجز أرسل:\nالغاء ${queueNumber}`,
      });
      return;
    }

    /* ───── 3. دور نشط (waiting / called) ───── */
    const existingActive = await Patient.findOne({
      phone,
      date: getTodayDate(),
      status: { $in: ["waiting", "called"] },
    });
    if (existingActive) {
      await sock.sendMessage(rawPhone, {
        text: `⏳ أنت مسجل بالفعل!\nرقم دورك: *${existingActive.queueNumber}*\n\nتابع دورك من هنا:\n${CLINIC_URL}/#/queue/${existingActive.queueNumber}\n\nلإلغاء الحجز أرسل:\nالغاء ${existingActive.queueNumber}`,
      });
      return;
    }

    /* ───── 4. مريض سابق (done / cancelled) ───── */
    const lastDoneOrCancelled = await Patient.findOne({
      phone,
      date: getTodayDate(),
      status: { $in: ["done", "cancelled"] },
    });
    if (lastDoneOrCancelled) {
      await Patient.create({
        phone,
        date: getTodayDate(),
        pending: true,
        status: "pending",
      });
      await sock.sendMessage(rawPhone, {
        text: "👋 أهلاً بعودتك\nأرسل اسمك الكامل لتأكيد الحجز الجديد.",
      });
      return;
    }

    /* ───── 5. مستخدم جديد تماماً ───── */
    await Patient.create({
      phone,
      date: getTodayDate(),
      pending: true,
      status: "pending",
    });
    await sock.sendMessage(rawPhone, {
      text: "👋 أهلاً بك في العيادة\nأرسل اسمك الكامل لتأكيد الحجز.",
    });
  } catch (err) {
    console.error("WhatsApp Error:", err);
    try {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ حدث خطأ، حاول مرة أخرى لاحقاً.",
      });
    } catch {}
  }
};

module.exports = { handleIncomingMessage };
