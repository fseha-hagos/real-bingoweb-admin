import axios from "axios";
import { authClient } from "./auth-client";

/**
 * Admin REST calls go through same-origin `/api/admin/*`
 * (rewritten to backend `/admin/*`) so session cookies are sent.
 */
const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api/admin"
    : process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "https://real-bingoweb-backend.onrender.com/admin";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true,
});

// Add request interceptor for debugging and auth
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    // Session is cookie-based; keep optional bearer for older flows
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token && token !== "cookie") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.withCredentials = true;
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the full error for debugging
    console.error("[API Response Error]", {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error("Authentication Error: User is not authenticated or session expired");
      error.message = `Unauthorized (401): ${error.response?.data?.error || "Please log in again"}`;
    }
    // Handle not found errors
    else if (error.response?.status === 404) {
      console.error("Not Found Error: Resource does not exist");
      error.message = `Not Found (404): ${error.response?.data?.error || "Resource not found"}`;
    }
    // Handle network errors
    else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error("Network Error: Check if the API server is running and accessible");
      error.message = "Unable to connect to the server. Please check your internet connection or contact support.";
    }

    return Promise.reject(error);
  }
);

// API Types
export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified: boolean;
  image?: string;
  phoneNumber?: string;
  phoneNumberVerified: boolean;
  registered: boolean;
  balance: number;
  isActive: boolean;
  role: 'ADMIN' | 'OPERATOR' | 'USER';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  invitedByTelegramId?: string;
  name?: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: string;
  stats?: {
    totalGames: number;
    totalWins: number;
    totalEarnings: number;
    referralCount: number;
  };
  referredUsers?: Partial<User>[];
}

export interface GameSession {
  id: string;
  name: string;
  status: "pending" | "active" | "completed" | "cancelled";
  maxPlayers: number;
  currentPlayers: number;
  entryFee: number;
  prizePool: number;
  startedAt?: string;
  completedAt?: string;
  winnerId?: string;
  winType?: "standard" | "fullhouse";
  createdAt: string;
}

export interface BingoCard {
  id: string;
  userId: string;
  gameSessionId: string;
  numbers: number[][];
  isWinner: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  description?: string;
  metadata?: any;
  gameId?: string;
  createdAt: string;
  deletedAt?: string;
  user?: Partial<User>;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    referrals: number;
    totalBalance: number;
  };
  games: {
    total: number;
    active: number;
    finished: number;
  };
  transactions: {
    total: number;
    deposits: number;
    withdrawals: number;
    bets: number;
    wins: number;
    profit: number;
  };
  winners: {
    total: number;
  };
  recentGames: any[];
}

export interface DepositRequest {
  id: string;
  type: string; // "deposit" or "withdraw"
  userId: string;
  amount: number;
  phoneNumber?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  adminNotes?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  user?: User;
}

export interface Tournament {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  bannerUrl?: string;
  betAmount: number;
  prizePool: number;
  status: "scheduled" | "active" | "ended";
  startAt: string;
  endAt: string;
  gameId?: string;
  winType?: "standard" | "fullhouse";
  createdAt: string;
  updatedAt: string;
}

// API Functions
export const apiService = {
  // Auth
  async login(phoneNumber: string, password: string): Promise<any> {
    const { data, error } = await authClient.signIn.phoneNumber({
      phoneNumber,
      password,
    });

    if (error) {
      throw new Error(error.message || "Login failed");
    }

    return data;
  },

  async logout() {
    await authClient.signOut();
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get("/dashboard/stats");
    console.log("RAW Dashboard API Response:", response.data);
    // Extract data from nested structure: { success: true, data: { ... } }
    if (response.data.success && response.data.data) {
      console.log("EXTRACTED Dashboard Data:", response.data.data);
      return response.data.data;
    }
    return response.data;
  },

  // Users
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const response = await api.get("/users", { params });

    // Handle nested data structure: { success: true, data: { users: [], pagination: {} } }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    // Fallback for direct structure
    return response.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async adjustBalance(id: string, data: { amount: number; action: "add" | "deduct"; reason: string }) {
    const response = await api.post(`/users/${id}/adjust-balance`, data);
    return response.data;
  },

  // Game Sessions
  async getGameSessions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const response = await api.get("/games", { params });
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async getGameSession(id: string): Promise<GameSession> {
    const response = await api.get(`/games/${id}`);
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async createGameSession(data: Partial<GameSession>): Promise<GameSession> {
    const response = await api.post("/games", data);
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async updateGameSession(
    id: string,
    data: Partial<GameSession>
  ): Promise<GameSession> {
    const response = await api.put(`/games/${id}`, data);
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async deleteGameSession(id: string): Promise<void> {
    await api.delete(`/games/${id}`);
  },

  // Bingo Cards
  async getBingoCards(params?: {
    page?: number;
    limit?: number;
    gameSessionId?: string;
    userId?: string;
  }) {
    const response = await api.get("/bingo-cards", { params });
    return response.data;
  },

  async getBingoCard(id: string): Promise<BingoCard> {
    const response = await api.get(`/bingo-cards/${id}`);
    return response.data;
  },

  // Settings
  async getSettings() {
    const response = await api.get("/settings");
    return response.data;
  },

  async updateSettings(data: any) {
    const response = await api.put("/settings", data);
    return response.data;
  },

  // Deposit/Withdraw Requests
  async getDepositRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: "deposit" | "withdraw";
  }) {
    const response = await api.get("/deposit-requests", { params });
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async getDepositRequest(id: string): Promise<DepositRequest> {
    const response = await api.get(`/deposit-requests/${id}`);
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async approveDepositRequest(id: string, notes?: string): Promise<DepositRequest> {
    const response = await api.put(`/deposit-requests/${id}/approve`, { notes });
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async rejectDepositRequest(id: string, notes?: string): Promise<DepositRequest> {
    const response = await api.put(`/deposit-requests/${id}/reject`, { notes });
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Tournaments
  async getTournaments(): Promise<Tournament[]> {
    const response = await api.get("/tournaments");
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async getTournament(id: string): Promise<Tournament> {
    const response = await api.get(`/tournaments/${id}`);
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async createTournament(data: Partial<Tournament>): Promise<Tournament> {
    const response = await api.post("/tournaments", data);
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament> {
    const response = await api.put(`/tournaments/${id}`, data);
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  async activateTournament(id: string, data?: { startAt: string }): Promise<Tournament> {
    const response = await api.post(`/tournaments/${id}/activate`, data);
    // Handle nested data structure
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Announcements
  async sendAnnouncement(data: {
    message: string;
    imageFile?: File;
    buttonText?: string;
    buttonUrl?: string;
    target: "channel" | "group" | "self";
  }): Promise<void> {
    const formData = new FormData();
    formData.append("message", data.message);
    formData.append("target", data.target);

    if (data.imageFile) {
      formData.append("image", data.imageFile);
    }
    if (data.buttonText) {
      formData.append("buttonText", data.buttonText);
    }
    if (data.buttonUrl) {
      formData.append("buttonUrl", data.buttonUrl);
    }

    await api.post("/announcements", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Transactions
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    userId?: string;
  }) {
    const response = await api.get("/transactions", { params });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
};

export default api;

