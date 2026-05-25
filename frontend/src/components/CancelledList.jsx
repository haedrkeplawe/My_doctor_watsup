export default function CancelledList({ patients }) {
  return (
    <div className="queue-section">
      <div className="section-header">
        <span className="section-title">❌ الملغيون</span>
        <span className="section-count cancelled">{patients.length}</span>
      </div>
      <div className="patients-list">
        {patients.map((patient) => (
          <div key={patient._id} className="patient-card cancelled">
            <div className="patient-info">
              <span className="patient-queue-num cancelled">
                #{patient.queueNumber}
              </span>
              <h3>{patient.name}</h3>
              <p>{patient.phone}</p>
            </div>
          </div>
        ))}
        {patients.length === 0 && <p className="empty-text">لا يوجد ملغيون</p>}
      </div>
    </div>
  );
}
