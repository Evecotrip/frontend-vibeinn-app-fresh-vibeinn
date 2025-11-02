// API FILE FOR AUTH RELATED REQUESTS
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_TIMESTAMP_KEY = 'token_timestamp';
export const AUTH_USER_ID_KEY = 'auth_user_id';
export const USER_SYNCED_KEY = 'user_synced';
export const TOKEN_OK_KEY = 'TOKEN_OK';

// Constants for better maintainability
const REQUEST_TIMEOUT = 10000;
const ACCESS_TOKEN_EXPIRY_MINUTES = 15;
const REFRESH_TOKEN_EXPIRY_DAYS = 180;

// Helper functions (internal, not changing existing function names)
const createRequestConfig = (body: object, signal?: AbortSignal) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
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


// Generate Refresh Token and Access Token
export async function generateTokens(firebaseUid?: string) {
  if (!firebaseUid) {
    throw new Error("Firebase UID is required for token generation");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    console.log("🍎 Generating tokens for firebaseUid:", firebaseUid);
    
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/generate-tokens`,
      createRequestConfig({ firebaseUid }, controller.signal)
    );

    clearTimeout(timeoutId);
    console.log("🍏Generate Tokens Response Status:", response.status);

    const data = await handleApiResponse(response, "token generation");
    console.log("🍎Generated Tokens Response:", data.data.tokens);
    
    // Save tokens to AsyncStorage with current timestamp
    const currentTime = Date.now();
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, data.data.tokens.accessToken],
      [REFRESH_TOKEN_KEY, data.data.tokens.refreshToken],
      [AUTH_USER_ID_KEY, data.data.user.authUserId],
      [TOKEN_TIMESTAMP_KEY, currentTime.toString()]
    ]);
    
    return data.data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    handleApiError(error, "generateTokens");
  }
}

// Retrieve existing access token and refresh token from backend if from frontend it's got deleted
export async function retrieveExistingTokens(firebaseUid: string) {
  if (!firebaseUid) {
    throw new Error("Firebase UID is required for token retrieval");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/retrieve-tokens`,
      createRequestConfig({ firebaseUid }, controller.signal)
    );

    clearTimeout(timeoutId);
    const data = await handleApiResponse(response, "token retrieval");
    
    console.log("🍎Retrieved Existing Tokens Response:", data.data.tokens);
    
    // Save tokens to AsyncStorage with current timestamp
    const currentTime = Date.now();
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, data.data.tokens.accessToken],
      [REFRESH_TOKEN_KEY, data.data.tokens.refreshToken],
      [TOKEN_TIMESTAMP_KEY, currentTime.toString()]
    ]);
    
    return data.data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    handleApiError(error, "retrieveExistingTokens");
  }
}

// Revoke tokens on logout
export async function revokeTokens(refreshToken: string) {
  if (!refreshToken) {
    throw new Error("Refresh token is required for revocation");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/revoke-token`,
      createRequestConfig({ refreshToken }, controller.signal)
    );

    clearTimeout(timeoutId);
    const data = await handleApiResponse(response, "token revocation");
    
    console.log("Revoke Tokens Response:", data);
    await clearStoredTokens();
    
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Even if revocation fails, clear local tokens for security
    await clearStoredTokens();
    handleApiError(error, "revokeTokens");
  }
}

// helper function to logout user in one call
export async function logoutUser() {
  try {
    const storedTokens = await getStoredTokens();
    
    if (storedTokens?.refreshToken) {
      await revokeTokens(storedTokens.refreshToken);
    } else {
      console.warn("No refresh token found, skipping revoke");
      await clearStoredTokens();
    }
    
    // Clear auth-related storage in parallel for better performance
    await Promise.all([
      AsyncStorage.removeItem(AUTH_USER_ID_KEY),
      AsyncStorage.removeItem(TOKEN_OK_KEY)
    ]);
    
    console.log("User logged out successfully");
  } catch (error: any) {
    console.error("Error logging out user:", error);
    // Force clear storage even on error for security
    await clearStoredTokens();
    await Promise.allSettled([
      AsyncStorage.removeItem(AUTH_USER_ID_KEY),
      AsyncStorage.removeItem(TOKEN_OK_KEY)
    ]);
  }
}

// Helper function to get stored tokens
export async function getStoredTokens() {
  try {
    const tokens = await AsyncStorage.multiGet([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      TOKEN_TIMESTAMP_KEY
    ]);
    
    // More efficient destructuring
    const [accessToken, refreshToken, timestamp] = tokens.map(([, value]) => value);
    
    if (!accessToken || !refreshToken || !timestamp) {
      return null;
    }
    
    return {
      accessToken,
      refreshToken,
      timestamp: parseInt(timestamp)
    };
  } catch (error: any) {
    console.error("Error getting stored tokens:", error);
    return null;
  }
}

// Function to get valid token with comprehensive expiration handling
export async function getValidToken(firebaseUid?: string): Promise<string | null> {
  try {
    let storedTokens = await getStoredTokens();
    
    // Step 1: Handle missing tokens
    if (!storedTokens && firebaseUid) {
      console.log("📱 No tokens found in AsyncStorage, attempting to retrieve from backend...");
      storedTokens = await handleMissingTokensRecovery(firebaseUid);
      
      if (!storedTokens) {
        return null;
      }
    }
    
    if (!storedTokens) {
      console.warn("⚠️ No tokens found and no firebaseUid provided for token generation");
      return null;
    }
    
    // Step 2: Calculate token ages
    const currentTime = Date.now();
    const timeDifference = currentTime - storedTokens.timestamp;
    const minutesPassed = Math.floor(timeDifference / (1000 * 60));
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    
    // Step 3: Handle refresh token expiry
    if (daysPassed >= REFRESH_TOKEN_EXPIRY_DAYS) {
      console.log(`🔄 Refresh token expired (${daysPassed} days old), generating new tokens...`);
      if (firebaseUid) {
        try {
          await generateTokens(firebaseUid);
          storedTokens = await getStoredTokens();
          console.log("✅ Successfully generated new tokens after refresh token expiry.");
          return storedTokens?.accessToken || null;
        } catch (error) {
          console.error("❌ Failed to generate new tokens after refresh token expiry:", error);
          return null;
        }
      } else {
        console.warn("⚠️ Refresh token expired but no firebaseUid provided for regeneration");
        return null;
      }
    }
    
    // Step 4: Return appropriate token based on access token expiry
    if (minutesPassed < ACCESS_TOKEN_EXPIRY_MINUTES) {
      console.log(`🎯 Using access token (${minutesPassed}min old, ${ACCESS_TOKEN_EXPIRY_MINUTES - minutesPassed}min remaining)`);
      // FIXED: Return access token when it's still valid (was returning refresh token) ----> NOT NOW (DEVELOPMENT PHASE)
      //return storedTokens.accessToken;
      console.log("👺👺Refresh Token: ",storedTokens.refreshToken)
      return storedTokens.refreshToken;
    } else {
      console.log(`🔄 Access token expired (${minutesPassed}min old), using refresh token (${daysPassed}d old)`);
      return storedTokens.refreshToken;
    }
    
  } catch (error) {
    console.error("❌ Error in getValidToken:", error);
    return null;
  }
}

// Internal helper for token recovery (not changing existing function names)
async function handleMissingTokensRecovery(firebaseUid: string) {
  try {
    await retrieveExistingTokens(firebaseUid);
    console.log("✅ Successfully retrieved tokens from backend.");
    return await getStoredTokens();
  } catch (retrieveError: any) {
    console.error("❌ Failed to retrieve tokens from backend:", retrieveError);
    try {
      console.log("🔄 Attempting to generate new tokens...");
      await generateTokens(firebaseUid);
      console.log("✅ Successfully generated new tokens.");
      return await getStoredTokens();
    } catch (generateError: any) {
      console.error("❌ Failed to generate new tokens:", generateError);
      return null;
    }
  }
}

// Helper function to clear stored tokens
export async function clearStoredTokens() {
  try {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      TOKEN_TIMESTAMP_KEY
    ]);
    console.log("Tokens cleared from storage");
  } catch (error) {
    console.error("Error clearing tokens:", error);
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