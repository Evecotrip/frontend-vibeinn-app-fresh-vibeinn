import { AUTH_USER_ID_KEY, getValidToken } from "@/api/auth/auth-api";
import {
  CreateAnonymousProfileRequest,
  CreateAnonymousProfileResponse,
  FetchAnonymousProfileResponse,
  UpdateAnonymousProfileRequest
} from "@/types/userTypes";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnonymousProfileInterface } from "../interfaces";


const ANONYMOUS_USER_ID_KEY = 'anonymous_user_id';

// AsyncStorage utilities
export const getStoredAnonymousUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ANONYMOUS_USER_ID_KEY);
  } catch (error) {
    console.error("❌ Failed to get anonymous user ID from storage:", error);
    return null;
  }
};

export const clearStoredAnonymousUserId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ANONYMOUS_USER_ID_KEY);
    console.log("🍏Cleared anonymous user ID from AsyncStorage");
  } catch (error) {
    console.error("❌ Failed to clear anonymous user ID from storage:", error);
  }
};

// Helper to get current user UID
const getCurrentUserUID = () => {
  const user = useUser();
  
  if (user) {
    console.log('Current User UID:', user.user?.id);
    return user.user?.id;
  }
  
  console.log('No user is currently signed in.');
  return null;
};

// Generic authenticated request helper
const makeAuthenticatedRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: object,
  requiresAuth: boolean = true
): Promise<T> => {
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (requiresAuth) {
    const firebaseUid = getCurrentUserUID();
    if (!firebaseUid) {
      throw new Error('User not authenticated');
    }
    
    const token = await getValidToken(firebaseUid);
    console.log("🍏Fetched token", token);
    if (!token) {
      throw new Error('No valid token available');
    }
    
    requestOptions.headers = {
      ...requestOptions.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_USER_API_BASE_URL}${endpoint}`, requestOptions);
  
  console.log("🔍 Response status:", response.status);
  console.log("🔍 Response status text:", response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.log("🚨 Error response body:", errorText);
    throw new Error(`${method} ${endpoint} failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Store anonymous ID in AsyncStorage with fallback
const storeAnonymousId = async (anonymousProfile: AnonymousProfileInterface | null): Promise<void> => {
  if (anonymousProfile?.anonymousId) {
    await AsyncStorage.setItem(ANONYMOUS_USER_ID_KEY, anonymousProfile.anonymousId);
    console.log("🍏Stored anonymous user ID in AsyncStorage:", anonymousProfile.anonymousId);
    return;
  }

  console.warn("⚠️ Anonymous profile created but no anonymousId found, trying fallback...");
  
  try {
    const authUserId = await AsyncStorage.getItem(AUTH_USER_ID_KEY);
    if (!authUserId) {
      console.error("❌ No auth user ID available for fallback");
      return;
    }

    const anonymousId = await getAnonymousIdByAuthUserId(authUserId);
    if (anonymousId) {
      await AsyncStorage.setItem(ANONYMOUS_USER_ID_KEY, anonymousId);
      console.log("🍏Fallback successful - Stored anonymous user ID from API:", anonymousId);
    } else {
      console.error("❌ Fallback failed - Could not retrieve anonymous ID from API");
    }
  } catch (fallbackError) {
    console.error("❌ Fallback error:", fallbackError);
  }
};

// Create Anonymous Profile for current user
export const createAnonymousProfile = async (createAnonymousProfile: CreateAnonymousProfileRequest): Promise<AnonymousProfileInterface> => {
  try {
    console.log("🍏Creating anonymous profile with data:", createAnonymousProfile);

    const data = await makeAuthenticatedRequest<CreateAnonymousProfileResponse>(
      '/user/anony',
      'POST',
      createAnonymousProfile
    );

    console.log("✅ Anonymous profile created:", data);
    
    const anonymousProfile = data.data.anonymousProfile;
    await storeAnonymousId(anonymousProfile);
    
    return anonymousProfile;
  } catch (error) {
    console.error("❌ Failed to create anonymous profile:", error);
    throw error;
  }
};

// Get anonymous profiles by auth user id (public endpoint)
export const getAnonymousIdByAuthUserId = async (authUserId: string): Promise<string | null> => {
  try {
    console.log("🔍 Fetching anonymous profiles for authUserId:", authUserId);
    
    const data = await makeAuthenticatedRequest<any>(
      `/user/anony/ids/${authUserId}`,
      'GET',
      undefined,
      false // This endpoint doesn't require authentication
    );

    console.log("✅ Fetched anonymous profiles response:", data);
    
    const anonymousProfiles = data.data?.anonymousProfiles;
    return anonymousProfiles?.[0]?.anonymousId || null;
  } catch (error) {
    console.error("❌ Failed to fetch anonymous profiles:", error);
    return null;
  }
};

// Generate new Anonymous name for anonymous profile
export const generateAnonymousName = async (): Promise<string | null> => {
  try {
    const data = await makeAuthenticatedRequest<any>(
      '/user/anony/generate-name',
      'POST'
    );

    console.log("✅ Generated anonymous name:", data);
    return data.data?.anonymousName || data.anonymousName || null;
  } catch (error) {
    console.error("❌ Failed to generate anonymous name:", error);
    return null;
  }
};

// Fetch Anonymous Profile by anonymous ID
export const fetchAnonymousProfileById = async (anonymousId: string): Promise<AnonymousProfileInterface | null> => {
  try {
    const data = await makeAuthenticatedRequest<FetchAnonymousProfileResponse>(
      `/user/anony/${anonymousId}`,
      'GET'
    );

    console.log("✅ Fetched anonymous profile:", data);
    return data.data.anonymousProfile;
  } catch (error) {
    console.error("❌ Failed to fetch anonymous profile:", error);
    return null;
  }
};

// Update Anonymous Profile by anonymous ID
export const updateAnonymousProfile = async (
  anonymousId: string, 
  updates: UpdateAnonymousProfileRequest
): Promise<AnonymousProfileInterface | null> => {
  try {
    const data = await makeAuthenticatedRequest<FetchAnonymousProfileResponse>(
      `/user/anony/${anonymousId}`,
      'PUT',
      updates
    );

    console.log("🍇Response", data);
    return data.data.anonymousProfile;
  } catch (error) {
    console.error('Error updating anonymous profile:', error);
    return null;
  }
};

// Delete Anonymous Profile by anonymous ID
export const deleteAnonymousProfile = async (anonymousId: string): Promise<boolean> => {
  try {
    await makeAuthenticatedRequest<any>(
      `/user/anony/${anonymousId}`,
      'DELETE'
    );

    console.log("✅ Anonymous profile deleted successfully");
    await clearStoredAnonymousUserId();
    return true;
  } catch (error) {
    console.error('Error deleting anonymous profile:', error);
    return false;
  }
};