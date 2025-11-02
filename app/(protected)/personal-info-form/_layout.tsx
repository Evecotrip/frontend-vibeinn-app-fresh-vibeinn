import { Stack } from "expo-router"

const PersonalInfoLayout = () => {
    return (
        <Stack>
            <Stack.Screen
                name="personalInfo"
                options={{
                    headerShown: false,
                }}
            />
            
        </Stack>
    )
}

export default PersonalInfoLayout