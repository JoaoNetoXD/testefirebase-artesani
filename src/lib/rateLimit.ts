import { NextRequest } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max number of requests per interval
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitData>();

// Default configurations for different endpoints
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  '/api/auth/login': { interval: 15 * 60 * 1000, uniqueTokenPerInterval: 5 }, // 5 attempts per 15 minutes
  '/api/auth/register': { interval: 60 * 60 * 1000, uniqueTokenPerInterval: 3 }, // 3 attempts per hour
  '/api/stripe/create-checkout-session': { interval: 60 * 1000, uniqueTokenPerInterval: 10 }, // 10 per minute
  '/api/contact': { interval: 60 * 1000, uniqueTokenPerInterval: 2 }, // 2 per minute
  '/api/products': { interval: 60 * 1000, uniqueTokenPerInterval: 100 }, // 100 per minute
  '/api/admin': { interval: 60 * 1000, uniqueTokenPerInterval: 50 }, // 50 per minute for admin
  'default': { interval: 60 * 1000, uniqueTokenPerInterval: 30 }, // 30 per minute default
};

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config?: RateLimitConfig) {
    this.config = config || rateLimitConfigs['default'];
  }

  async check(identifier: string): Promise<{
    success: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
  }> {
    const now = Date.now();
    const data = rateLimitStore.get(identifier);

    // If no data exists or the time window has passed, reset
    if (!data || now > data.resetTime) {
      const newData: RateLimitData = {
        count: 1,
        resetTime: now + this.config.interval,
      };
      rateLimitStore.set(identifier, newData);
      
      return {
        success: true,
        remaining: this.config.uniqueTokenPerInterval - 1,
        resetTime: newData.resetTime,
      };
    }

    // Check if limit exceeded
    if (data.count >= this.config.uniqueTokenPerInterval) {
      return {
        success: false,
        remaining: 0,
        resetTime: data.resetTime,
        error: 'Rate limit exceeded',
      };
    }

    // Increment count
    data.count++;
    rateLimitStore.set(identifier, data);

    return {
      success: true,
      remaining: this.config.uniqueTokenPerInterval - data.count,
      resetTime: data.resetTime,
    };
  }

  // Clean up expired entries
  static cleanup() {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Get identifier from request
export function getIdentifier(request: NextRequest): string {
  // Priority order: user ID > IP address > user-agent hash
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             request.ip || 
             'unknown';

  return `ip:${ip}`;
}

// Get rate limit config for endpoint
export function getRateLimitConfig(pathname: string): RateLimitConfig {
  // Check for exact match first
  if (rateLimitConfigs[pathname]) {
    return rateLimitConfigs[pathname];
  }

  // Check for pattern matches
  for (const [pattern, config] of Object.entries(rateLimitConfigs)) {
    if (pathname.startsWith(pattern)) {
      return config;
    }
  }

  return rateLimitConfigs['default'];
}

// Middleware helper
export async function rateLimitMiddleware(
  request: NextRequest,
  pathname?: string
): Promise<Response | null> {
  try {
    const path = pathname || request.nextUrl.pathname;
    const config = getRateLimitConfig(path);
    const rateLimiter = new RateLimiter(config);
    const identifier = getIdentifier(request);

    const result = await rateLimiter.check(identifier);

    if (!result.success) {
      const resetTimeSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
      
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: resetTimeSeconds,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': resetTimeSeconds.toString(),
            'X-RateLimit-Limit': config.uniqueTokenPerInterval.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', config.uniqueTokenPerInterval.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.resetTime.toString());

    // Return null to continue processing, headers will be added later
    return null;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Don't block requests if rate limiting fails
    return null;
  }
}

// Client-side rate limiting helper
export class ClientRateLimiter {
  private limits = new Map<string, { count: number; resetTime: number }>();

  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const limit = this.limits.get(key);

    if (!limit || now > limit.resetTime) {
      this.limits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  getTimeUntilReset(key: string): number {
    const limit = this.limits.get(key);
    if (!limit) return 0;
    return Math.max(0, limit.resetTime - Date.now());
  }
}

// Start cleanup interval
if (typeof window === 'undefined') {
  // Only run on server side
  setInterval(RateLimiter.cleanup, 60 * 1000); // Clean up every minute
} 