
// Export all admin-related functionality from a single entry point
export type { AdminUser, AdminSession, StoredSessionData } from "@/types/admin";

export {
  generateSessionToken,
  createAdminSession,
  validateAdminSession,
  cleanupExpiredSessions
} from "./sessionManager";

export {
  loginAdmin,
  isAdmin
} from "./authService";

export {
  storeAdminSession,
  getAdminSession,
  clearAdminSession
} from "./sessionStorage";
