import { useEffect, useState } from "react";
import axios from "axios";

import CurrentPatient from "./components/CurrentPatient";
import WaitingList from "./components/WaitingList";
import DoneList from "./components/DoneList";
import CancelledList from "./components/CancelledList";

const API = "http://localhost:4000/api/queue";

function App() {
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);

  const loadData = async () => {
    try {
      const queueRes = await axios.get(API);
      const currentRes = await axios.get(`${API}/current`);
      setPatients(queueRes.data);
      setCurrentPatient(currentRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const resetQueue = async () => {
    if (!window.confirm("هل أنت متأكد؟ سيتم حذف جميع السجلات وتصفير العداد!"))
      return;
    try {
      await axios.post(`${API}/reset`);
      loadData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء التصفير");
    }
  };

  const waitingPatients = patients.filter((p) => p.status === "waiting");
  const donePatients = patients.filter((p) => p.status === "done").reverse();
  const cancelledPatients = patients
    .filter((p) => p.status === "cancelled")
    .reverse();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button className="reset-btn" onClick={resetQueue}>
          🗑️ تصفير
        </button>
        <h1 className="dashboard-title">🏥 عيادة د. خالد</h1>
        <p className="dashboard-subtitle">لوحة إدارة المرضى</p>
      </div>

      <div className="dashboard-body">
        <CurrentPatient currentPatient={currentPatient} refresh={loadData} />
        <WaitingList patients={waitingPatients} refresh={loadData} />
        <DoneList patients={donePatients} />
        <CancelledList patients={cancelledPatients} />
      </div>
    </div>
  );
}

export default App;
