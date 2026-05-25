import axios from "axios";

const API = "http://localhost:4000/api/queue";

export const getQueue = () => axios.get(`${API}`);
export const getCurrent = () => axios.get(`${API}/current`);
export const callNext = () => axios.post(`${API}/call-next`);
export const markDone = (id) => axios.patch(`${API}/${id}/done`);
export const cancelPatient = (id) => axios.patch(`${API}/${id}/cancel`);
