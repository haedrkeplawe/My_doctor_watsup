import axios from "axios";

const API = "http://localhost:4000/api/queue";

export default function WaitingList({ patients, refresh }) {
  const cancelPatient = async (id, name) => {
    if (!window.confirm(`هل تريد إلغاء دور ${name}؟`)) return;
    try {
      await axios.patch(`${API}/${id}/cancel`);
      refresh();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الإلغاء");
    }
  };

  const callSpecificPatient = async (id) => {
    if (
      !window.confirm(
        "هل تريد استدعاء هذا المريض؟ (سينهي دور المريض الحالي إن وُجد)",
      )
    )
      return;
    try {
      const res = await axios.patch(`${API}/${id}/call`);
      if (res.data.success) {
        refresh();
      } else {
        alert(res.data.message || "لا يمكن استدعاء المريض");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء استدعاء المريض");
    }
  };

  return (
    <div className="queue-section">
      <div className="section-header">
        <span className="section-title">⏳ المنتظرون</span>
        <span className="section-count">{patients.length}</span>
      </div>
      <div className="patients-list">
        {patients.map((patient) => (
          <div key={patient._id} className="patient-card waiting">
            <div className="patient-info">
              <span className="patient-queue-num">#{patient.queueNumber}</span>
              <h3>{patient.name}</h3>
              <p>{patient.phone}</p>
            </div>
            <div className="patient-actions">
              <button
                className="call-btn"
                onClick={() => callSpecificPatient(patient._id)}
              >
                استدعاء
              </button>
              <button
                className="cancel-btn"
                onClick={() => cancelPatient(patient._id, patient.name)}
              >
                إلغاء
              </button>
            </div>
          </div>
        ))}
        {patients.length === 0 && (
          <p className="empty-text">لا يوجد مرضى في الانتظار</p>
        )}
      </div>
    </div>
  );
}
