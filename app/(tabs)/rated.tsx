import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MovieCard from "../../components/MovieCard";
import { getMovieDetails } from "../../services/api";
import { getRatedMovies } from "../../services/storage";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  user_rating: number;
}

export default function RatedScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRatedMovies = useCallback(async () => {
    setLoading(true);
    const ratedMovies = await getRatedMovies();
    const movieIds = Object.keys(ratedMovies);

    if (movieIds.length > 0) {
      const moviePromises = movieIds.map(async (id) => {
        const details = await getMovieDetails(Number(id));
        return {
          ...details,
          user_rating: ratedMovies[Number(id)],
        };
      });

      const detailedMovies = await Promise.all(moviePromises);
      detailedMovies.sort((a, b) => b.user_rating - a.user_rating);
      setMovies(detailedMovies);
    } else {
      setMovies([]);
    }

    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRatedMovies();
    }, [fetchRatedMovies])
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {movies.length > 0 ? (
        <FlatList
          data={movies}
          renderItem={({ item }) => (
            <MovieCard movie={item} showRating={true} />
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Você ainda não avaliou nenhum filme.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
  },
});
