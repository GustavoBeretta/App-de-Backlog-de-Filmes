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
import { getMoviesByStatus, getTotalWatchedTime } from "../../services/storage";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

export default function WatchedScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);

  const fetchWatchedMovies = async () => {
    setLoading(true);
    const watchedMovieIds = await getMoviesByStatus("watched");
    if (watchedMovieIds.length > 0) {
      const fetchedMovies = await getMoviesDetails(watchedMovieIds);
      setMovies(fetchedMovies);
    } else {
      setMovies([]);
    }
    const time = await getTotalWatchedTime();
    setTotalTime(time);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchWatchedMovies();
    }, [])
  );

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

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
        <>
          <View style={styles.totalTimeContainer}>
            <Text style={styles.totalTimeText}>
              Tempo total assistido: {formatTime(totalTime)}
            </Text>
          </View>
          <FlatList
            data={movies}
            renderItem={({ item }) => <MovieCard movie={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.list}
          />
        </>
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
  totalTimeContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  totalTimeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
