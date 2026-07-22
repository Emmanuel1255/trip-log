import { Stack } from "expo-router";

export default function VehiclesDriversLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="vehicles/add"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="vehicles/[id]" />
      <Stack.Screen
        name="vehicles/[id]/edit"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="drivers/add"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="drivers/[id]" />
      <Stack.Screen
        name="drivers/[id]/edit"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}
