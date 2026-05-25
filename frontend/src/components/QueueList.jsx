import { useEffect, useState } from "react";
import { getQueue } from "../api/queue";

export default function QueueList() {
  const [patients, setPatients] = useState([]);

  const load = async () => {
    const res = await getQueue();
    setPatients(res.data);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>📋 قائمة الانتظار</h2>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>#</th>
            <th>الاسم</th>
            <th>الحالة</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((p) => (
            <tr key={p._id}>
              <td>{p.queueNumber}</td>
              <td>{p.name}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
