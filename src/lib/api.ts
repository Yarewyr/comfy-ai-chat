const API_BASE_URL = "http://localhost:8000";

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  msg: string;
}

interface GenerateResponse {
  response: string;
}

interface ApiError {
  detail: string;
}

// Auth token management
export const getToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("auth_token");
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// API calls
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || "Login failed");
  }

  const data: LoginResponse = await response.json();
  setToken(data.token);
  return data;
};

export const register = async (username: string, password: string): Promise<RegisterResponse> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || "Registration failed");
  }

  return response.json();
};

export const generateResponse = async (text: string): Promise<string> => {
  const token = getToken();
  
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      throw new Error("Session expired. Please login again.");
    }
    const error: ApiError = await response.json();
    throw new Error(error.detail || "Generation failed");
  }

  const data: GenerateResponse = await response.json();
  return data.response;
};

export const logout = (): void => {
  removeToken();
};
