import { Stack } from "expo-router"

const ExploreLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="explore-page" options={{ headerShown: false }} />
        </Stack>
    )
}
export default ExploreLayout