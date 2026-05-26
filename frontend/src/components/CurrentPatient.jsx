import axios from "axios";

const API = "https://my-doctor-watsup.onrender.com/api/queue";

export default function CurrentPatient({ currentPatient, refresh }) {
  const waitingCount = currentPatient?.waitingCount ?? 0;
  const hasCurrentPatient = currentPatient?.currentNumber > 0;

  const callNext = async () => {
    try {
      const res = await axios.post(`${API}/call-next`);
      if (res.data.success) {
        refresh();
      } else {
        alert(res.data.message || "لا يوجد مرضى");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء استدعاء المريض");
    }
  };

  const endCurrentTurn = async () => {
    if (!currentPatient?.currentId) return;
    try {
      await axios.patch(`${API}/${currentPatient.currentId}/done`);
      refresh();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إنهاء الدور");
    }
  };

  const getButton = () => {
    if (waitingCount > 0) {
      return (
        <button className="next-button" onClick={callNext}>
          ▶ استدعاء التالي ({waitingCount} منتظر)
        </button>
      );
    }
    if (hasCurrentPatient) {
      return (
        <button className="next-button done-btn" onClick={endCurrentTurn}>
          ✅ إنهاء الدور
        </button>
      );
    }
    return null;
  };

  return (
    <div className="current-patient-card">
      <div className="current-patient-top">
        <p className="current-label">👨‍⚕️ المريض الحالي</p>
        {hasCurrentPatient ? (
          <>
            <h1 className="current-number">#{currentPatient.currentNumber}</h1>
            <p className="current-name">{currentPatient.currentName}</p>
            <p className="current-phone">{currentPatient.currentPhone}</p>
          </>
        ) : (
          <p className="no-patient-text">لا يوجد مريض حالياً</p>
        )}
      </div>
      {getButton() && (
        <div className="current-patient-bottom">{getButton()}</div>
      )}
    </div>
  );
}
