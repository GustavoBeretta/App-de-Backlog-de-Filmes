import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getMovieDetails } from "../../services/api";
import {
  getMovieStatus,
  MovieStatus,
  toggleMovieStatus,
} from "../../services/storage";

interface MovieDetails {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  backdrop_path: string;
}

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ watched: false, wantToWatch: false });

  const fetchMovieData = useCallback(async () => {
    if (id) {
      setLoading(true);
      const details = await getMovieDetails(Number(id));
      setMovie(details);
      const movieStatus = await getMovieStatus(Number(id));
      setStatus(movieStatus);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMovieData();
  }, [fetchMovieData]);

  const handleToggleStatus = async (newStatus: MovieStatus) => {
    if (movie) {
      await toggleMovieStatus(movie.id, newStatus);
      const updatedStatus = await getMovieStatus(movie.id);
      setStatus(updatedStatus);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.container}>
        <Text>Filme não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: movie.title }} />
      <Image
        source={{
          uri: `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`,
        }}
        style={styles.backdrop}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            }}
            style={styles.poster}
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.releaseDate}>
              Lançamento:{" "}
              {new Date(movie.release_date).toLocaleDateString("pt-BR")}
            </Text>
            <Text style={styles.rating}>
              Avaliação: {movie.vote_average.toFixed(1)} / 10
            </Text>
          </View>
        </View>
        <Text style={styles.overviewTitle}>Sinopse</Text>
        <Text style={styles.overview}>{movie.overview}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, status.wantToWatch && styles.buttonActive]}
            onPress={() => handleToggleStatus("wantToWatch")}
          >
            <Text
              style={[
                styles.buttonText,
                status.wantToWatch && styles.buttonTextActive,
              ]}
            >
              Quero Assistir
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, status.watched && styles.buttonActive]}
            onPress={() => handleToggleStatus("watched")}
          >
            <Text
              style={[
                styles.buttonText,
                status.watched && styles.buttonTextActive,
              ]}
            >
              Já Assisti
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    marginTop: -80,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerText: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  releaseDate: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  rating: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
  },
  button: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007bff",
  },
  buttonActive: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  buttonTextActive: {
    color: "#fff",
  },
});
