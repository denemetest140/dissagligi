import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Attach token from localStorage as fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dentalin_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function formatApiError(detail) {
  if (detail == null) return "Bir hata oluştu. Lütfen tekrar deneyin.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const CLINIC_DEFAULT = {
  name: "Dentalin Ağız ve Diş Sağlığı Merkezi",
  address: "Ziya Gökalp Mahallesi, Turgut Özal Bulvarı No:5, Batman Merkez",
  phone: "04882125556",
  phone_display: "0488 212 55 56",
  whatsapp: "904882125556",
  email: "info@dentalin.com",
  hours: { hafta_ici: "09:00 - 19:00", cumartesi: "09:00 - 17:00", pazar: "Kapalı" },
  maps_query: "Dentalin Diş Batman",
};

export function waLink(message) {
  const wa = "904882125556";
  return `https://wa.me/${wa}?text=${encodeURIComponent(message || "Merhaba, bilgi almak istiyorum.")}`;
}

export function telLink() {
  return `tel:+904882125556`;
}
