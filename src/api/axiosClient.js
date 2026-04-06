import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + '/api', // ใช้ร่วมกับ Proxy ใน vite.config.js  
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor สำหรับขาออก (Request) 
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // ดึง Token ที่เก็บไว้ตอน Login  
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // แปะกุญแจ JWT  
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor สำหรับขาเข้า (Response) [cite: 2026-04-02]
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // ถ้า Token หมดอายุ หรือไม่ถูกต้อง ให้เตะกลับไปหน้า Login  
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;