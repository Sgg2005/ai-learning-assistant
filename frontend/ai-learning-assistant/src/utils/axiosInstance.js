import axios from "axios";
import { BASE_URL } from "./apiPath";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-type": "application/json",
        Accept: "application/json",
    },
    withCredentials: false,
});

//request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");

    // don't attach token for auth endpoints
    const isAuthRoute = config.url?.includes("/auth/login") || config.url?.includes("/auth/register");

    if (accessToken && !isAuthRoute) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

//response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if(error.response){
            if(error.response.status === 401){
                console.error(error.response?.data?.error || "Unauthorized");
            }
        } else if (error.code === "ECONNABORTED") {
            console.error("Request timeout. Please check your network connection.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;