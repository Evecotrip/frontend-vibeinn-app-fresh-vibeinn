import { Stack } from "expo-router"

const EditProfileLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="editProfile" options={{ headerShown: false }} />
            <Stack.Screen name="edit-profilePic" options={{ headerShown: false }} />
            <Stack.Screen name="edit-username" options={{ headerShown: false }} />
        </Stack>
    )
}

export default EditProfileLayout