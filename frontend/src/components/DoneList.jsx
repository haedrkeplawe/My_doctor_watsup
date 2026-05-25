export default function DoneList({ patients }) {
  return (
    <div className="queue-section">
      <div className="section-header">
        <span className="section-title">✅ تم علاجهم</span>
        <span className="section-count done">{patients.length}</span>
      </div>
      <div className="patients-list">
        {patients.map((patient) => (
          <div key={patient._id} className="patient-card done">
            <div className="patient-info">
              <span className="patient-queue-num done">
                #{patient.queueNumber}
              </span>
              <h3>{patient.name}</h3>
              <p>{patient.phone}</p>
            </div>
          </div>
        ))}
        {patients.length === 0 && <p className="empty-text">لا يوجد مرضى</p>}
      </div>
    </div>
  );
}
