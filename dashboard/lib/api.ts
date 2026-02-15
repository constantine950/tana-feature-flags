import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  register: async (email: string, password: string, name?: string) => {
    const response = await api.post("/api/v1/auth/register", {
      email,
      password,
      name,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post("/api/v1/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/api/v1/auth/me");
    return response.data;
  },
};

export const projectsApi = {
  list: async () => {
    const response = await api.get("/api/v1/projects");
    return response.data;
  },

  create: async (name: string, description?: string) => {
    const response = await api.post("/api/v1/projects", {
      name,
      description,
    });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/api/v1/projects/${id}`);
    return response.data;
  },

  update: async (id: string, name?: string, description?: string) => {
    const response = await api.put(`/api/v1/projects/${id}`, {
      name,
      description,
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/projects/${id}`);
    return response.data;
  },
};

// Environments API
export const environmentsApi = {
  list: async (projectId: string) => {
    const response = await api.get(
      `/api/v1/projects/${projectId}/environments`,
    );
    return response.data;
  },

  create: async (projectId: string, name: string, key: string) => {
    const response = await api.post(
      `/api/v1/projects/${projectId}/environments`,
      {
        name,
        key,
      },
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/environments/${id}`);
    return response.data;
  },

  rotateKey: async (id: string) => {
    const response = await api.post(`/api/v1/environments/${id}/rotate-key`);
    return response.data;
  },
};
