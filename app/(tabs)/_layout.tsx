import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Populares",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="watched"
        options={{
          title: "Já Assisti",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="check-square" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wantToWatch"
        options={{
          title: "Quero Assistir",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="list" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
