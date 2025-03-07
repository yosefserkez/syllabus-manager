// In-memory rate limiting implementation
const rateLimitStore = new Map<string, number[]>();

const WINDOW_SIZE = 60 * 60; // 1 hour in seconds
const MAX_REQUESTS = 10; // 10 requests per hour

export async function rateLimit(identifier: string) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - WINDOW_SIZE;

  // Get existing requests and clean up old ones
  const requests = rateLimitStore.get(identifier) || [];
  const validRequests = requests.filter(timestamp => timestamp > windowStart);

  // Check if limit is exceeded
  if (validRequests.length >= MAX_REQUESTS) {
    const oldestRequest = Math.min(...validRequests);
    const resetTime = oldestRequest + WINDOW_SIZE;
    return {
      success: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      reset: resetTime
    };
  }

  // Add new request
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);

  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - validRequests.length,
    reset: now + WINDOW_SIZE
  };
}

// Cleanup function to prevent memory leaks
export function cleanupRateLimitStore() {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - WINDOW_SIZE;

  Array.from(rateLimitStore.entries()).forEach(([identifier, requests]) => {
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    if (validRequests.length === 0) {
      rateLimitStore.delete(identifier);
    } else {
      rateLimitStore.set(identifier, validRequests);
    }
  });
}

// Run cleanup every hour
setInterval(cleanupRateLimitStore, WINDOW_SIZE * 1000);