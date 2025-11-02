import { Stack } from "expo-router"

const VerticalVideosLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="vertical-videos" options={{ headerShown: false }} />
        </Stack>
    )
}
export default VerticalVideosLayout