import { api } from "./api";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from "../types/User";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/login.php", credentials);

      if (response.success && response.token) {
        localStorage.setItem("authToken", response.token);
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Erreur de connexion",
      };
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/register.php", data);

      if (response.success && response.token) {
        localStorage.setItem("authToken", response.token);
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: "Erreur lors de l'inscription",
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/logout.php", {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
  },

  getToken(): string | null {
    return localStorage.getItem("authToken");
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
