// API FILE FOR AUTH RELATED REQUESTS - V2 (Using Clerk + Secure Storage)
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Token storage keys (using SecureStore for sensitive data)
const ACCESS_TOKEN_KEY = 'secure_access_token';
const REFRESH_TOKEN_KEY = 'secure_refresh_token';
const TOKEN_TIMESTAMP_KEY = 'secure_token_timestamp';
const USER_ID_KEY = 'secure_user_id';
const TENANT_ID_KEY = 'secure_tenant_id';
const USER_EMAIL_KEY = 'secure_user_email';

// Legacy keys for backward compatibility (can be removed later)
export const AUTH_USER_ID_KEY = 'auth_user_id';
export const USER_SYNCED_KEY = 'user_synced';
export const TOKEN_OK_KEY = 'TOKEN_OK';

// API Configuration
const TENANT_API_KEY = process.env.EXPO_PUBLIC_TENANT_API_KEY;

// Constants for better maintainability
const REQUEST_TIMEOUT = 15000;
const ACCESS_TOKEN_EXPIRY_MINUTES = 14; // Updated to 14 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 6; // Updated to 6 days

// Helper functions for API requests
const createRequestConfig = (
  method: string = "POST",
  body?: object,
  token?: string,
  signal?: AbortSignal
) => ({
  method,
  headers: {
    "Content-Type": "application/json",
    "X-Tenant-API-Key": TENANT_API_KEY,
    ...(token && { "Authorization": `Bearer ${token}` }),
  },
  ...(body && { body: JSON.stringify(body) }),
  ...(signal && { signal }),
});

const handleApiResponse = async (response: Response, operation: string) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed ${operation}: ${response.status} ${response.statusText}. ${errorData.message || ''}`
    );
  }
  return response.json();
};

const handleApiError = (error: any, operation: string) => {
  if (error.name === 'AbortError') {
    console.error(`Request timeout: ${operation} took too long`);
    throw new Error("Request timeout: Please try again");
  }
  console.error(`Error in ${operation}:`, error);
  throw error;
};

// Secure storage helpers
const securelyStoreValue = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    throw error;
  }
};

const securelyGetValue = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
};

const securelyDeleteValue = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error deleting ${key}:`, error);
  }
};

// Generate JWT Tokens using Clerk User ID
export async function generateTokens(clerkUserId?: string) {
  if (!clerkUserId) {
    throw new Error("Clerk User ID is required for token generation");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    console.log("🔐 Generating tokens for clerkUserId:", clerkUserId);
    
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/token`,
      createRequestConfig("POST", { clerkUserId }, undefined, controller.signal)
    );

    clearTimeout(timeoutId);
    console.log("✅ Generate Tokens Response Status:", response.status);

    const data = await handleApiResponse(response, "token generation");
    console.log("🔐 Generated Tokens Response:", {
      hasAccessToken: !!data.data.accessToken,
      hasRefreshToken: !!data.data.refreshToken,
      expiresIn: data.data.expiresIn,
      user: data.data.user
    });
    
    // Save tokens securely with current timestamp
    const currentTime = Date.now();
    await Promise.all([
      securelyStoreValue(ACCESS_TOKEN_KEY, data.data.accessToken),
      securelyStoreValue(REFRESH_TOKEN_KEY, data.data.refreshToken),
      securelyStoreValue(TOKEN_TIMESTAMP_KEY, currentTime.toString()),
      securelyStoreValue(USER_ID_KEY, data.data.user.id),
      securelyStoreValue(TENANT_ID_KEY, data.data.user.tenantId),
      securelyStoreValue(USER_EMAIL_KEY, data.data.user.email),
      // Store user ID in AsyncStorage for backward compatibility
      AsyncStorage.setItem(AUTH_USER_ID_KEY, data.data.user.id)
    ]);
    
    return data.data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    handleApiError(error, "generateTokens");
  }
}

// Refresh JWT Token using refresh token
export async function refreshAccessToken() {
  const refreshToken = await securelyGetValue(REFRESH_TOKEN_KEY);
  
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    console.log("🔄 Refreshing access token...");
    
    // Send refresh token in request body, not Authorization header
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/refresh`,
      createRequestConfig("POST", { refreshToken }, undefined, controller.signal)
    );

    clearTimeout(timeoutId);
    const data = await handleApiResponse(response, "token refresh");
    
    console.log("✅ Refreshed Tokens:", {
      hasAccessToken: !!data.data.accessToken,
      expiresIn: data.data.expiresIn,
      user: data.data.user
    });
    
    // Save new access token securely with current timestamp
    // Note: Backend only returns new accessToken, not a new refreshToken
    const currentTime = Date.now();
    await Promise.all([
      securelyStoreValue(ACCESS_TOKEN_KEY, data.data.accessToken),
      securelyStoreValue(TOKEN_TIMESTAMP_KEY, currentTime.toString()),
      // Update user info if provided
      ...(data.data.user?.id ? [securelyStoreValue(USER_ID_KEY, data.data.user.id)] : []),
      ...(data.data.user?.tenantId ? [securelyStoreValue(TENANT_ID_KEY, data.data.user.tenantId)] : []),
      ...(data.data.user?.email ? [securelyStoreValue(USER_EMAIL_KEY, data.data.user.email)] : [])
    ]);
    
    return data.data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    handleApiError(error, "refreshAccessToken");
  }
}

// Validate current access token
export async function validateToken() {
  const accessToken = await securelyGetValue(ACCESS_TOKEN_KEY);
  
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/validate`,
      createRequestConfig("GET", undefined, accessToken, controller.signal)
    );

    clearTimeout(timeoutId);
    const data = await handleApiResponse(response, "token validation");
    
    console.log("✅ Token is valid:", data.data);
    return data.data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("❌ Token validation failed:", error);
    return null;
  }
}

// Get current user info
export async function getCurrentUser() {
  const accessToken = await securelyGetValue(ACCESS_TOKEN_KEY);
  
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/me`,
      createRequestConfig("GET", undefined, accessToken, controller.signal)
    );

    clearTimeout(timeoutId);
    const data = await handleApiResponse(response, "get current user");
    
    console.log("✅ Current user:", data.data);
    return data.data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    handleApiError(error, "getCurrentUser");
  }
}

// Revoke tokens on logout
export async function revokeTokens() {
  const accessToken = await securelyGetValue(ACCESS_TOKEN_KEY);
  
  if (!accessToken) {
    console.log("⚠️ No access token found, skipping revocation");
    await clearStoredTokens();
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    console.log("🔒 Revoking tokens...");
    
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/revoke`,
      createRequestConfig("POST", undefined, accessToken, controller.signal)
    );

    clearTimeout(timeoutId);
    const data = await handleApiResponse(response, "token revocation");
    
    console.log("✅ Tokens revoked successfully:", data.message);
    await clearStoredTokens();
    
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("❌ Token revocation failed:", error);
    // Even if revocation fails, clear local tokens for security
    await clearStoredTokens();
  }
}

// Helper function to logout user in one call
export async function logoutUser() {
  try {
    // Attempt to revoke tokens (when backend endpoint is ready)
    await revokeTokens();
    
    // Clear auth-related storage in parallel for better performance
    await Promise.all([
      AsyncStorage.removeItem(AUTH_USER_ID_KEY),
      AsyncStorage.removeItem(TOKEN_OK_KEY),
      AsyncStorage.removeItem(USER_SYNCED_KEY)
    ]);
    
    console.log("✅ User logged out successfully");
  } catch (error: any) {
    console.error("❌ Error logging out user:", error);
    // Force clear storage even on error for security
    await clearStoredTokens();
    await Promise.allSettled([
      AsyncStorage.removeItem(AUTH_USER_ID_KEY),
      AsyncStorage.removeItem(TOKEN_OK_KEY),
      AsyncStorage.removeItem(USER_SYNCED_KEY)
    ]);
  }
}

// Helper function to get stored tokens from secure storage
export async function getStoredTokens() {
  try {
    const [accessToken, refreshToken, timestamp] = await Promise.all([
      securelyGetValue(ACCESS_TOKEN_KEY),
      securelyGetValue(REFRESH_TOKEN_KEY),
      securelyGetValue(TOKEN_TIMESTAMP_KEY)
    ]);
    
    if (!accessToken || !refreshToken || !timestamp) {
      return null;
    }
    
    return {
      accessToken,
      refreshToken,
      timestamp: parseInt(timestamp)
    };
  } catch (error: any) {
    console.error("❌ Error getting stored tokens:", error);
    return null;
  }
}

// Helper function to get stored user info
export async function getStoredUserInfo() {
  try {
    const [userId, tenantId, email] = await Promise.all([
      securelyGetValue(USER_ID_KEY),
      securelyGetValue(TENANT_ID_KEY),
      securelyGetValue(USER_EMAIL_KEY)
    ]);
    
    if (!userId) {
      return null;
    }
    
    return {
      userId,
      tenantId,
      email
    };
  } catch (error: any) {
    console.error("❌ Error getting stored user info:", error);
    return null;
  }
}

// Function to get valid access token with automatic refresh
export async function getValidToken(clerkUserId?: string): Promise<string | null> {
  try {
    let storedTokens = await getStoredTokens();
    
    // Step 1: Handle missing tokens
    if (!storedTokens && clerkUserId) {
      console.log("📱 No tokens found in secure storage, generating new tokens...");
      try {
        await generateTokens(clerkUserId);
        storedTokens = await getStoredTokens();
        console.log("✅ Successfully generated new tokens.");
      } catch (error) {
        console.error("❌ Failed to generate new tokens:", error);
        return null;
      }
    }
    
    if (!storedTokens) {
      console.warn("⚠️ No tokens found and no clerkUserId provided for token generation");
      return null;
    }
    
    // Step 2: Calculate token ages
    const currentTime = Date.now();
    const timeDifference = currentTime - storedTokens.timestamp;
    const minutesPassed = Math.floor(timeDifference / (1000 * 60));
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    
    // Step 3: Handle refresh token expiry (6 days)
    if (daysPassed >= REFRESH_TOKEN_EXPIRY_DAYS) {
      console.log(`🔄 Refresh token expired (${daysPassed} days old), generating new tokens...`);
      if (clerkUserId) {
        try {
          await generateTokens(clerkUserId);
          storedTokens = await getStoredTokens();
          console.log("✅ Successfully generated new tokens after refresh token expiry.");
          return storedTokens?.accessToken || null;
        } catch (error) {
          console.error("❌ Failed to generate new tokens after refresh token expiry:", error);
          return null;
        }
      } else {
        console.warn("⚠️ Refresh token expired but no clerkUserId provided for regeneration");
        return null;
      }
    }
    
    // Step 4: Handle access token expiry (14 minutes)
    if (minutesPassed >= ACCESS_TOKEN_EXPIRY_MINUTES) {
      console.log(`🔄 Access token expired (${minutesPassed}min old), refreshing...`);
      try {
        await refreshAccessToken();
        storedTokens = await getStoredTokens();
        console.log("✅ Successfully refreshed access token.");
        return storedTokens?.accessToken || null;
      } catch (error) {
        console.error("❌ Failed to refresh access token:", error);
        // If refresh fails and we have clerkUserId, try generating new tokens
        if (clerkUserId) {
          try {
            await generateTokens(clerkUserId);
            storedTokens = await getStoredTokens();
            console.log("✅ Generated new tokens after refresh failure.");
            return storedTokens?.accessToken || null;
          } catch (genError) {
            console.error("❌ Failed to generate new tokens:", genError);
            return null;
          }
        }
        return null;
      }
    }
    
    // Step 5: Return valid access token
    console.log(`✅ Using valid access token (${minutesPassed}min old, ${ACCESS_TOKEN_EXPIRY_MINUTES - minutesPassed}min remaining)`);
    return storedTokens.accessToken;
    
  } catch (error) {
    console.error("❌ Error in getValidToken:", error);
    return null;
  }
}

// Helper function to clear stored tokens from secure storage
export async function clearStoredTokens() {
  try {
    await Promise.all([
      securelyDeleteValue(ACCESS_TOKEN_KEY),
      securelyDeleteValue(REFRESH_TOKEN_KEY),
      securelyDeleteValue(TOKEN_TIMESTAMP_KEY),
      securelyDeleteValue(USER_ID_KEY),
      securelyDeleteValue(TENANT_ID_KEY),
      securelyDeleteValue(USER_EMAIL_KEY)
    ]);
    console.log("✅ Tokens cleared from secure storage");
  } catch (error) {
    console.error("❌ Error clearing tokens:", error);
  }
}

// Helper function to check if tokens exist in storage
export async function hasStoredTokens(): Promise<boolean> {
  try {
    const tokens = await getStoredTokens();
    return tokens !== null;
  } catch (error) {
    console.error("Error checking stored tokens:", error);
    return false;
  }
}

// Helper function to check token expiration status
export async function getTokenExpirationStatus(): Promise<{
  hasTokens: boolean;
  accessTokenExpired: boolean;
  refreshTokenExpired: boolean;
  minutesSinceCreation: number;
  daysSinceCreation: number;
} | null> {
  try {
    const storedTokens = await getStoredTokens();
    
    if (!storedTokens) {
      return {
        hasTokens: false,
        accessTokenExpired: true,
        refreshTokenExpired: true,
        minutesSinceCreation: 0,
        daysSinceCreation: 0,
      };
    }
    
    const currentTime = Date.now();
    const timeDifference = currentTime - storedTokens.timestamp;
    const minutesPassed = Math.floor(timeDifference / (1000 * 60));
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    
    return {
      hasTokens: true,
      accessTokenExpired: minutesPassed >= ACCESS_TOKEN_EXPIRY_MINUTES,
      refreshTokenExpired: daysPassed >= REFRESH_TOKEN_EXPIRY_DAYS,
      minutesSinceCreation: minutesPassed,
      daysSinceCreation: daysPassed,
    };
  } catch (error) {
    console.error("Error checking token expiration status:", error);
    return null;
  }
}

// Sync user to database (for backward compatibility - may need updating based on new backend)
export async function syncUserToDatabase(clerkUserId: string, authMethod: string = 'clerk') {
  console.log("⚠️ syncUserToDatabase may need updating for new backend architecture");
  // This function may need to be reimplemented based on your new backend's user sync requirements
  // For now, token generation handles user creation/sync
  return true;
}
