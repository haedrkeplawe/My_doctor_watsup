const Patient = require("../models/patient");
const { getSock } = require("../config/whatsapp");

const getTodayDate = () => new Date().toISOString().split("T")[0];

// تحويل الرقم لصيغة Baileys
const toJid = (phone) =>
  phone.includes("@") ? phone : `${phone}@s.whatsapp.net`;

// جلب قائمة المرضى اليوم
const getQueue = async (req, res) => {
  try {
    const patients = await Patient.find({ date: getTodayDate() }).sort({
      queueNumber: 1,
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// استدعاء المريض التالي
const callNext = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      date: getTodayDate(),
      status: "waiting",
    }).sort({ queueNumber: 1 });

    if (!patient) {
      return res.json({
        success: false,
        message: "لا يوجد مرضى في الانتظار حالياً",
        current: null,
      });
    }

    patient.status = "called";
    await patient.save();

    const sock = getSock();
    await sock.sendMessage(toJid(patient.phone), {
      text: `🏥 دورك الآن يا ${patient.name}!\nتفضل للداخل.`,
    });

    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إنهاء دور مريض
const markDone = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status: "done" },
      { new: true },
    );

    if (patient) {
      try {
        const sock = getSock();
        await sock.sendMessage(toJid(patient.phone), {
          text:
            `🌹 شكراً ${patient.name} على زيارتكم.\n` +
            `نتمنى لك الشفاء العاجل و دوام الصحة و العافية.\n` +
            `🏥 عيادتنا في خدمتكم دائماً.`,
        });
      } catch (waError) {
        console.error("فشل إرسال رسالة الواتساب:", waError.message);
      }
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إلغاء دور مريض
const cancelPatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true },
    );

    const sock = getSock();
    await sock.sendMessage(toJid(patient.phone), {
      text: `❌ عذراً يا ${patient.name},   تم إلغاء دورك من قبل الطبيب.\nللتسجيل مجدداً أرسل أي رسالة.`,
    });

    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// جلب الدور الحالي
const getCurrentQueue = async (req, res) => {
  try {
    const current = await Patient.findOne({
      date: getTodayDate(),
      status: "called",
    });

    const waitingCount = await Patient.countDocuments({
      date: getTodayDate(),
      status: "waiting",
    });

    res.json({
      currentNumber: current ? current.queueNumber : 0,
      currentName: current ? current.name : null,
      currentPhone: current ? current.phone : null,
      currentId: current ? current._id : null,
      waitingCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// استدعاء مريض معين مباشرة
const callPatient = async (req, res) => {
  try {
    const currentPatient = await Patient.findOne({
      date: getTodayDate(),
      status: "called",
    });

    if (currentPatient) {
      currentPatient.status = "done";
      await currentPatient.save();

      try {
        const sock = getSock();
        await sock.sendMessage(toJid(currentPatient.phone), {
          text:
            `🌹 شكراً ${currentPatient.name} على زيارتكم.\n` +
            `نتمنى لك الشفاء العاجل و دوام الصحة و العافية.\n` +
            `🏥 عيادتنا في خدمتكم دائماً.`,
        });
      } catch (e) {
        console.error("فشل إرسال الوداع:", e.message);
      }
    }

    const patient = await Patient.findOne({
      _id: req.params.id,
      date: getTodayDate(),
      status: "waiting",
    });

    if (!patient) {
      return res
        .status(404)
        .json({ message: "المريض غير موجود أو ليس في الانتظار" });
    }

    patient.status = "called";
    await patient.save();

    try {
      const sock = getSock();
      await sock.sendMessage(toJid(patient.phone), {
        text: `🏥 دورك الآن يا ${patient.name}!\nتفضل للداخل.`,
      });
    } catch (e) {
      console.error("فشل إرسال الإشعار:", e.message);
    }

    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تصفير السجلات والعداد
const resetQueue = async (req, res) => {
  try {
    const Counter = require("../models/counter");
    await Patient.deleteMany({});
    await Counter.deleteMany({});
    res.json({ success: true, message: "تم تصفير السجلات والعداد بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQueue,
  callNext,
  markDone,
  cancelPatient,
  getCurrentQueue,
  callPatient,
  resetQueue,
};
