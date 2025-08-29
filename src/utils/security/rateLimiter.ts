// Simple client-side rate limiter for admin login attempts
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
}

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();

  // Check if the identifier (IP/email) is rate limited
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(identifier);
    
    if (!entry) {
      return false;
    }

    // Reset if window has passed
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
      this.attempts.delete(identifier);
      return false;
    }

    return entry.attempts >= MAX_ATTEMPTS;
  }

  // Record a failed attempt
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry) {
      this.attempts.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return;
    }

    // Reset if window has passed
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
      this.attempts.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return;
    }

    // Increment attempts
    entry.attempts++;
    entry.lastAttempt = now;
    this.attempts.set(identifier, entry);
  }

  // Get remaining attempts
  getRemainingAttempts(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry) return MAX_ATTEMPTS;

    const now = Date.now();
    // Reset if window has passed
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
      this.attempts.delete(identifier);
      return MAX_ATTEMPTS;
    }

    return Math.max(0, MAX_ATTEMPTS - entry.attempts);
  }

  // Get time until reset
  getTimeUntilReset(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry) return 0;

    const timeElapsed = Date.now() - entry.firstAttempt;
    return Math.max(0, RATE_LIMIT_WINDOW - timeElapsed);
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [identifier, entry] of this.attempts.entries()) {
      if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
        this.attempts.delete(identifier);
      }
    }
  }
}

// Global instance
export const rateLimiter = new RateLimiter();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);