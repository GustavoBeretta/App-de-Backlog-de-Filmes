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
import { getMoviesDetails } from "../../services/api";
import { getMoviesByStatus } from "../../services/storage";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

export default function WatchedScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchedMovies = async () => {
    setLoading(true);
    const watchedMovieIds = await getMoviesByStatus("watched");
    if (watchedMovieIds.length > 0) {
      const fetchedMovies = await getMoviesDetails(watchedMovieIds);
      setMovies(fetchedMovies);
    } else {
      setMovies([]);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchWatchedMovies();
    }, [])
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
      {movies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {'Você ainda não marcou nenhum filme como "Já Assisti".'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={({ item }) => (
            <MovieCard
              id={item.id}
              title={item.title}
              poster_path={item.poster_path}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
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
  list: {
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
});
