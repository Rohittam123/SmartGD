import axios from "axios";
import { auth } from "../config/firebase.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_FUNCTIONS_BASE_URL,
  timeout: 60000
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function evaluateGD(payload) {
  const { data } = await api.post("/evaluate", payload);
  return data;
}

export async function generateGDSummary(payload) {
  const { data } = await api.post("/summary", payload);
  return data;
}

export async function generateGDTopic(payload = {}) {
  const { data } = await api.post("/topic", payload);
  return data;
}

export async function askMentor(payload) {
  const { data } = await api.post("/mentor", payload);
  return {
    message: data?.reply || data?.message || "",
    raw: data
  };
}
