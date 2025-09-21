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

export default function WantToWatchScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWantToWatchMovies = async () => {
    setLoading(true);
    const wantToWatchMovieIds = await getMoviesByStatus("wantToWatch");
    if (wantToWatchMovieIds.length > 0) {
      const fetchedMovies = await getMoviesDetails(wantToWatchMovieIds);
      setMovies(fetchedMovies);
    } else {
      setMovies([]);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchWantToWatchMovies();
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
            {
              'Você ainda não adicionou nenhum filme à sua lista de "Quero Assistir".'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={({ item }) => <MovieCard movie={item} />}
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
