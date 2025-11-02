import { getValidToken } from "@/api/auth/auth-api";
import {
  CheckUsernameAvailabilityResponse,
  GenerateUsernameResponse,
  UpdateUsernameResponse,
  UsernameSuggestionsResponse,
  ValidateUsernameResponse
} from "@/types/userTypes";
import { useUser } from "@clerk/clerk-expo";

// Helper to get firebaseUid
const getCurrentUserUID = () => {
  const user = useUser();
  
  if (user) {
    console.log('Current User UID:', user.user?.id);
    return user.user?.id;
  }
  
  console.log('No user is currently signed in.');
  return null;
};

// Generic helper for authenticated API requests
const makeAuthenticatedRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT',
  body?: object
): Promise<T> => {
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
      'Authorization': `Bearer ${token}`
    }
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_USER_API_BASE_URL}${endpoint}`, requestOptions);

  if (!response.ok) {
    throw new Error(`Error in ${method} ${endpoint}: ${response.statusText}`);
  }

  return response.json();
};

// Generate unique username based on display name
export const generateUniqueUsername = async (displayName: string): Promise<string> => {
  try {
    const data = await makeAuthenticatedRequest<GenerateUsernameResponse>(
      '/user/generate', 
      'POST', 
      { displayName }
    );
    return data.data.username;
  } catch (error) {
    console.error('Error in generateUniqueUsername:', error);
    throw error;
  }
};

// Check username availability
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const data = await makeAuthenticatedRequest<CheckUsernameAvailabilityResponse>(
      `/users/check/${username}`, 
      'GET'
    );
    return data.data.isAvailable;
  } catch (error) {
    console.error('Error in checkUsernameAvailability:', error);
    throw error;
  }
};

// Update username
export const updateUsername = async (username: string): Promise<string> => {
  try {
    const data = await makeAuthenticatedRequest<UpdateUsernameResponse>(
      '/users/usernameup', 
      'PUT', 
      { username }
    );
    console.log('Username updated successfully:', data.data.username);
    return data.data.username;
  } catch (error) {
    console.error('Error in updateUsername:', error);
    throw error;
  }
};

// Get username suggestions
export const getUsernameSuggestions = async (displayName: string): Promise<string[]> => {
  try {
    const data = await makeAuthenticatedRequest<UsernameSuggestionsResponse>(
      '/users/username/suggestions', 
      'POST', 
      { displayName }
    );
    return data.data.suggestions;
  } catch (error) {
    console.error('Error in getUsernameSuggestions:', error);
    throw error;
  }
};

// Validate username
export const validateUsername = async (username: string): Promise<{ isValid: boolean; message: string }> => {
  try {
    const data = await makeAuthenticatedRequest<ValidateUsernameResponse>(
      '/users/username/validate', 
      'POST', 
      { username }
    );
    return { 
      isValid: data.data.isValid, 
      message: data.data.error || data.message || 'Username validation completed'
    };
  } catch (error) {
    console.error('Error in validateUsername:', error);
    throw error;
  }
};