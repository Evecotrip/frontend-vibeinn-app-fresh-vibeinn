import { Stack } from "expo-router";

const AnonymousProfileLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="anonymousProfile"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    )
}

export default AnonymousProfileLayout;