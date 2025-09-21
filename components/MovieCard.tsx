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

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  user_rating?: number;
}

interface MovieCardProps {
  movie: Movie;
  showRating?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, showRating }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/movie/${movie.id}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.container}>
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          }}
          style={styles.poster}
        />
        <Text style={styles.title}>{movie.title}</Text>
        {showRating && movie.user_rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              Sua Nota: {movie.user_rating} / 5
            </Text>
          </View>
        )}
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
    position: "relative",
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
  ratingContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default MovieCard;
