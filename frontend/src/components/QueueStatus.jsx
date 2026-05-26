import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "https://my-doctor-watsup.onrender.com/api/queue";

export default function QueueStatus() {
  const { number } = useParams();
  const myNumber = parseInt(number);

  const [currentNumber, setCurrentNumber] = useState(0);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [queueRes, currentRes] = await Promise.all([
        axios.get(API),
        axios.get(`${API}/current`),
      ]);

      const waiting = queueRes.data.filter((p) => p.status === "waiting");
      setWaitingPatients(waiting);
      setCurrentNumber(currentRes.data.currentNumber || 0);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const myPosition = waitingPatients.findIndex(
    (p) => p.queueNumber === myNumber,
  );
  const beforeMe = myPosition === -1 ? 0 : myPosition;
  const isMyTurn = currentNumber === myNumber;
  const isDone = currentNumber > myNumber;

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.clinicName}>🏥 عيادة د. خالد</h1>
        <p style={styles.subtitle}>تتحدث كل 10 ثواني</p>
      </div>

      {/* Current */}
      <div style={styles.currentCard}>
        <p style={styles.currentLabel}>الدور الحالي</p>
        <h2 style={styles.currentNumber}>#{currentNumber || "—"}</h2>
      </div>

      {/* My Status */}
      <div
        style={{
          ...styles.myCard,
          background: isMyTurn ? "#dcfce7" : isDone ? "#f1f5f9" : "#eff6ff",
          borderColor: isMyTurn ? "#16a34a" : isDone ? "#94a3b8" : "#1a56db",
        }}
      >
        <p style={styles.myLabel}>رقمك</p>
        <h2
          style={{
            ...styles.myNumber,
            color: isMyTurn ? "#16a34a" : isDone ? "#94a3b8" : "#1a56db",
          }}
        >
          #{myNumber}
        </h2>
        {isMyTurn && <p style={styles.myTurnText}>🎉 دورك الآن! تفضل للداخل</p>}
        {isDone && <p style={styles.doneText}>✅ تم علاجك، شكراً لزيارتك</p>}
        {!isMyTurn && !isDone && (
          <p style={styles.waitText}>⏳ {beforeMe} شخص قبلك</p>
        )}
      </div>

      {/* Waiting List */}
      {waitingPatients.length > 0 && (
        <div style={styles.listCard}>
          <p style={styles.listTitle}>قائمة الانتظار</p>
          {waitingPatients.map((p) => (
            <div
              key={p._id}
              style={{
                ...styles.listItem,
                background: p.queueNumber === myNumber ? "#dbeafe" : "#f8fafc",
                fontWeight: p.queueNumber === myNumber ? "700" : "400",
              }}
            >
              <span style={styles.listNum}>#{p.queueNumber}</span>
              <span style={styles.listName}>{p.name}</span>
              {p.queueNumber === myNumber && (
                <span style={styles.youBadge}>أنت</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "420px",
    margin: "0 auto",
    padding: "16px",
    fontFamily: "'Tajawal', sans-serif",
    direction: "rtl",
    minHeight: "100vh",
    background: "#f0f4f8",
  },
  loading: {
    textAlign: "center",
    color: "#64748b",
    marginTop: "40px",
    fontSize: "16px",
  },
  header: {
    background: "linear-gradient(135deg, #1a56db, #1e40af)",
    borderRadius: "18px",
    padding: "20px",
    textAlign: "center",
    marginBottom: "14px",
  },
  clinicName: {
    color: "white",
    fontSize: "22px",
    fontWeight: "800",
    margin: "0 0 4px 0",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "12px",
    margin: 0,
  },
  currentCard: {
    background: "white",
    borderRadius: "18px",
    padding: "20px",
    textAlign: "center",
    marginBottom: "14px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  currentLabel: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  currentNumber: {
    color: "#0f172a",
    fontSize: "48px",
    fontWeight: "800",
    margin: 0,
  },
  myCard: {
    borderRadius: "18px",
    padding: "20px",
    textAlign: "center",
    marginBottom: "14px",
    border: "2px solid",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  myLabel: {
    fontSize: "13px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  myNumber: {
    fontSize: "48px",
    fontWeight: "800",
    margin: "0 0 8px 0",
  },
  myTurnText: {
    color: "#16a34a",
    fontSize: "16px",
    fontWeight: "700",
    margin: 0,
  },
  doneText: {
    color: "#94a3b8",
    fontSize: "15px",
    margin: 0,
  },
  waitText: {
    color: "#64748b",
    fontSize: "15px",
    margin: 0,
  },
  listCard: {
    background: "white",
    borderRadius: "18px",
    padding: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  listTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 12px 0",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    marginBottom: "6px",
  },
  listNum: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1a56db",
    minWidth: "35px",
  },
  listName: {
    fontSize: "15px",
    flex: 1,
  },
  youBadge: {
    background: "#1a56db",
    color: "white",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "20px",
  },
};
