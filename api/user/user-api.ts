import { getValidToken } from "@/api/auth/auth-api";
import { CurrentProfileResponse, UpdateProfileRequest } from "@/types/userTypes";
import { useUser } from "@clerk/clerk-expo";

const getCurrentUserUID = () => {
  const user = useUser();
  
  if (user) {
    console.log('Current User UID:', user.user?.id);
    return user.user?.id;
  }
  
  console.log('No user is currently signed in.');
  return null;
};

// Helper function to handle common API logic
const makeAuthenticatedRequest = async (
  endpoint: string, 
  method: 'GET' | 'PUT' = 'GET', 
  body?: object
): Promise<CurrentProfileResponse | null> => {
  try {
    const firebaseUid = getCurrentUserUID();
    if (!firebaseUid) {
      throw new Error('User not authenticated');
    }
    
    const token = await getValidToken(firebaseUid);
    console.log("🍏Fetched token", token);
    if (!token) {
      throw new Error('No valid token available');
    }

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_USER_API_BASE_URL}${endpoint}`, requestOptions);

    console.log("🔍 Response status:", response.status);
    console.log("🔍 Response status text:", response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("🚨 Error response body:", errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: CurrentProfileResponse = await response.json();
    console.log("🍇Response", data);
    return data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error);
    return null;
  }
};

export const getCurrentUserProfile = async (): Promise<CurrentProfileResponse | null> => {
  return makeAuthenticatedRequest('/users/profile', 'GET');
};

export const updateUserProfile = async (profileUpdates: UpdateProfileRequest): Promise<CurrentProfileResponse | null> => {
  return makeAuthenticatedRequest('/users/profile', 'PUT', profileUpdates);
};

export const updateUserProfilePic = async (profileImageUrl: string): Promise<CurrentProfileResponse | null> => {
  return makeAuthenticatedRequest('/users/profile', 'PUT', { profileImageUrl });
};