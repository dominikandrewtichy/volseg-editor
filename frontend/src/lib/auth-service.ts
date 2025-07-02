import { authGetUsersToken, authLogout, authVerifyAuth } from "./client";

export const AuthService = {
  login(redirectPath = "/") {
    const loginUrl = new URL(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
    );
    loginUrl.searchParams.set("redirect", redirectPath);
    window.location.href = loginUrl.toString();
  },

  async logout() {
    try {
      const response = await authLogout();
      return response.response.ok;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  },

  async getToken(): Promise<string | undefined> {
    try {
      const response = await authGetUsersToken();
      return response.data ?? undefined;
    } catch (error) {
      console.error("Auth check error:", error);
      return undefined;
    }
  },

  async verify() {
    try {
      const response = await authVerifyAuth();
      return !!response.data;
    } catch {
      return false;
    }
  },
};
