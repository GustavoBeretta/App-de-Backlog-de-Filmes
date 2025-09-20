import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface MovieCardProps {
  id: number;
  title: string;
  poster_path: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, poster_path }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/movie/${id}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.container}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${poster_path}` }}
          style={styles.poster}
        />
        <Text style={styles.title}>{title}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poster: {
    width: "100%",
    height: CARD_WIDTH * 1.5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    padding: 8,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default MovieCard;
