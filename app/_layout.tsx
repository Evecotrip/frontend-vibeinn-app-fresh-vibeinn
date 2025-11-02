import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { router, Stack, useSegments } from "expo-router";
import { useEffect, useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { generateTokens, getTokenExpirationStatus, hasStoredTokens } from "../api/auth/auth-api-v2";

// ===== CLERK TOKEN MANAGEMENT =====
// Using auth-api-v2.ts for secure token management
// - generateTokens(clerkUserId): Generate new JWT tokens
// - getTokenExpirationStatus(): Check token validity
// - hasStoredTokens(): Check if tokens exist in secure storage
// ===== END CLERK TOKEN MANAGEMENT =====

// ===== FIREBASE IMPORTS - COMMENTED OUT =====
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";
// import { generateTokens, syncUserToDatabase, USER_SYNCED_KEY } from "../api/auth/auth-api";
// ===== END FIREBASE IMPORTS =====

// ===== FIREBASE CODE - COMMENTED OUT =====
// Token generation cache key
// export const TOKEN_OK_KEY = 'TOKEN_OK';

// Helper functions for token cache management
// const checkTokenCache = async (userId: string): Promise<boolean> => {
//   try {
//     const cacheData = await AsyncStorage.getItem(TOKEN_OK_KEY);
//     if (!cacheData) return false;
//     
//     const cache = JSON.parse(cacheData);
//     const currentTime = Date.now();
//     const CACHE_EXPIRY_HOURS = 500; // Cache expires after 1 hour
//     const cacheExpiryTime = cache.timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
//     
//     // Check if cache is valid and for the same user
//     if (cache.status === 'YES' && 
//         cache.userId === userId && 
//         currentTime < cacheExpiryTime) {
//       console.log("✅ Token cache valid, skipping generation");
//       return true;
//     } else {
//       console.log("⏰ Token cache expired or invalid, will regenerate");
//       return false;
//     }
//   } catch (error) {
//     console.error("❌ Error checking token cache:", error);
//     return false;
//   }
// };

// const setTokenCache = async (userId: string, status: 'YES' | 'NO'): Promise<void> => {
//   try {
//     const cacheData = {
//       status,
//       userId,
//       timestamp: Date.now()
//     };
//     await AsyncStorage.setItem(TOKEN_OK_KEY, JSON.stringify(cacheData));
//     console.log(`💾 Token cache set: ${status} for user ${userId}`);
//   } catch (error) {
//     console.error("❌ Error setting token cache:", error);
//   }
// };

// const clearTokenCache = async (): Promise<void> => {
//   try {
//     await AsyncStorage.removeItem(TOKEN_OK_KEY);
//     console.log("🗑️ Token cache cleared");
//   } catch (error) {
//     console.error("❌ Error clearing token cache:", error);
//   }
// };

// Helper function to handle user sync and token generation with proper sequencing
// const handleUserSyncAndTokenGeneration = async (user: FirebaseAuthTypes.User): Promise<void> => {
//   const userSynced = await AsyncStorage.getItem(USER_SYNCED_KEY);
//   
//   if (userSynced === 'YES') {
//     // User is already synced, generate tokens directly
//     console.log("✅ User already synced, generating tokens directly");
//     await generateTokens(user.uid);
//     return;
//   }

//   // User sync status unknown, try to generate tokens first (optimistic approach)
//   console.log("🔄 Attempting to generate tokens for potentially existing user");
//   try {
//     await generateTokens(user.uid);
//     console.log("✅ Tokens generated successfully - user was already in database");
//     // Mark user as synced since tokens worked
//     await AsyncStorage.setItem(USER_SYNCED_KEY, 'YES');
//   } catch (generateError: any) {
//     console.log("⚠️ Token generation failed, checking if user needs sync...");
//     
//     // Check if the error indicates user doesn't exist in database
//     const errorMessage = generateError.message?.toLowerCase() || '';
//     const isUserNotFoundError = errorMessage.includes('404') || 
//                                errorMessage.includes('user not found') ||
//                                errorMessage.includes('not found') ||
//                                errorMessage.includes('user does not exist');
//     
//     if (isUserNotFoundError) {
//       console.log("🆕 New user detected, syncing to database first...");
//       
//       // Get Firebase ID token for OAuth sync
//       const firebaseToken = await user.getIdToken();
//       
//       // Determine OAuth provider from user data
//       const provider = user.providerData?.[0]?.providerId?.includes('google') ? 'google' : 
//                       user.providerData?.[0]?.providerId?.includes('facebook') ? 'facebook' :
//                       user.providerData?.[0]?.providerId?.includes('apple') ? 'apple' : 'google';
//       
//       console.log(`🔗 Detected OAuth provider: ${provider}`);
//       
//       // Sync user to database first
//       await syncUserToDatabase(firebaseToken, provider);
//       console.log("✅ User synced to database successfully");
//       
//       // Now generate tokens
//       console.log("🔄 Generating tokens after successful sync...");
//       await generateTokens(user.uid);
//       console.log("✅ Tokens generated successfully after sync");
//     } else {
//       // Some other error occurred, re-throw it
//       console.error("❌ Unexpected error during token generation:", generateError);
//       throw generateError;
//     }
//   }
// };
// ===== END FIREBASE CODE =====



// ===== FIREBASE ROOT LAYOUT - COMMENTED OUT =====
// export default function RootLayout() {
//   const [initializing, setInitializing] = useState(true);
//   const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
//   const segments = useSegments();

//   // Memoize the auth state change handler to prevent unnecessary re-renders
//   const onAuthStateChanged = useCallback(
//     async (user: FirebaseAuthTypes.User | null) => {
//       console.log("🚀 onStateChanged", user);
//       
//       if (user) {
//         // User is logged in
//         const firebaseToken = await user.getIdToken(); // Firebase ID Token (JWT)
//         console.log("✅ Firebase Token:", firebaseToken);
//         
//         // Check if tokens were already generated recently for this user
//         const isCacheValid = await checkTokenCache(user.uid);
//         
//         if (!isCacheValid) {
//           try {
//             // Handle user sync and token generation with proper sequencing
//             console.log("🔄 Handling user sync and token generation for user:", user.uid);
//             await handleUserSyncAndTokenGeneration(user);
//             
//             // Mark tokens as generated for this user
//             await setTokenCache(user.uid, 'YES');
//             console.log("✅ User sync and token generation completed successfully");
//           } catch (error) {
//             console.error("❌ Failed to sync user or generate backend tokens:", error);
//             // Mark token generation as failed
//             await setTokenCache(user.uid, 'NO');
//             // Don't block the auth flow if token generation fails
//           }
//         }
//       } else {
//         // User is logged out - clear token cache
//         console.log("👤 User logged out");
//         await clearTokenCache();
//       }

//       setUser(user);
//       if (initializing) setInitializing(false);
//     },
//     [initializing]
//   );

//   // Configure Google Sign-In
//   useEffect(() => {
//     GoogleSignin.configure({
//       webClientId: process.env.EXPO_PUBLIC_OAUTH_CLIENT_ID || "", // From Firebase Console
//     });
//   }, []);

//   // Set up Firebase auth listener
//   useEffect(() => {
//     const unsubscribe = auth().onAuthStateChanged(onAuthStateChanged);
//     return unsubscribe; // Return the unsubscriber function
//   }, [onAuthStateChanged]);

//   // Navigation logic based on authentication state
//   useEffect(() => {
//     if (initializing) return;
//     const inAuthGroup = segments[0] === "(protected)";
//     if (user && !inAuthGroup) {
//       router.replace("/(protected)/(tabs)/home");
//     } else if (!user && inAuthGroup) {
//       router.replace("/");
//     }
//   }, [user, initializing]);
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//     <ClerkProvider tokenCache={tokenCache}>
//       <RootLayoutNav user={user} />
//       </ClerkProvider>
//     </GestureHandlerRootView>
//   );
// }
// ===== END FIREBASE ROOT LAYOUT =====

// ===== CLERK ROOT LAYOUT =====
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <RootLayoutNav />
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const [tokenInitialized, setTokenInitialized] = useState(false);

  // Handle token generation when Clerk user is available
  const handleTokenGeneration = useCallback(async (clerkUserId: string) => {
    try {
      console.log("🔐 Checking token status for Clerk user:", clerkUserId);
      
      // Check if tokens already exist
      const tokensExist = await hasStoredTokens();
      
      if (tokensExist) {
        // Check token expiration status
        const tokenStatus = await getTokenExpirationStatus();
        
        if (tokenStatus && !tokenStatus.refreshTokenExpired) {
          console.log("✅ Valid tokens found:", {
            accessTokenExpired: tokenStatus.accessTokenExpired,
            minutesSinceCreation: tokenStatus.minutesSinceCreation,
            daysSinceCreation: tokenStatus.daysSinceCreation
          });
          // Tokens exist and refresh token is still valid
          // getValidToken will handle access token refresh if needed
          setTokenInitialized(true);
          return;
        } else {
          console.log("⚠️ Refresh token expired, generating new tokens...");
        }
      } else {
        console.log("📱 No tokens found, generating new tokens...");
      }
      
      // Generate new tokens
      await generateTokens(clerkUserId);
      console.log("✅ Tokens generated successfully for Clerk user");
      setTokenInitialized(true);
      
    } catch (error) {
      console.error("❌ Failed to generate tokens:", error);
      setTokenInitialized(true); // Set to true anyway to not block navigation
    }
  }, []);

  // Initialize tokens when user signs in
  useEffect(() => {
    if (!isLoaded) return;
    
    if (isSignedIn && user?.id && !tokenInitialized) {
      console.log("🚀 Clerk user authenticated, initializing tokens...");
      handleTokenGeneration(user.id);
    } else if (!isSignedIn) {
      // Reset token initialization state when user signs out
      setTokenInitialized(false);
    }
  }, [isSignedIn, isLoaded, user?.id, tokenInitialized, handleTokenGeneration]);

  // Navigation logic based on Clerk authentication state
  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(protected)";

    if (isSignedIn && !inAuthGroup) {
      // User is signed in but not in protected routes, redirect to home
      router.replace("/(protected)/(tabs)/home");
    } else if (!isSignedIn && inAuthGroup) {
      // User is not signed in but trying to access protected routes, redirect to index
      router.replace("/");
    }
  }, [isSignedIn, isLoaded, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(public)" />
      <Stack.Screen name="(protected)" />
    </Stack>
  );
}

// ===== TOKEN GENERATION NOTES =====
// - Tokens are automatically generated when a Clerk user signs in
// - Access tokens expire after 14 minutes and are auto-refreshed
// - Refresh tokens expire after 6 days, requiring new token generation
// - Tokens are stored securely using expo-secure-store
// - Token validation happens automatically via getValidToken() in API calls
// ===== END TOKEN GENERATION NOTES =====

// ===== FIREBASE ROOT LAYOUT NAV - COMMENTED OUT =====
// function RootLayoutNav({ user }: { user: FirebaseAuthTypes.User | null }) {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="index" />
//       <Stack.Screen name="(public)" />
//       <Stack.Protected guard={!!user}>
//         <Stack.Screen name="(protected)" />
//       </Stack.Protected>
//     </Stack>
//   );
// }
// ===== END FIREBASE ROOT LAYOUT NAV =====
