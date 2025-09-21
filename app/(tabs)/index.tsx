import { debounce } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import MovieCard from "../../components/MovieCard";
import { getPopularMovies, searchMovies } from "../../services/api";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

export default function Index() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMovies = async (query: string) => {
    setLoading(true);
    const fetchedMovies = query
      ? await searchMovies(query)
      : await getPopularMovies();
    setMovies(fetchedMovies);
    setLoading(false);
  };

  const debouncedFetchMovies = useCallback(debounce(fetchMovies, 300), []);

  useEffect(() => {
    if (searchQuery) {
      debouncedFetchMovies(searchQuery);
    } else {
      fetchMovies(""); // Fetch popular movies when search is cleared
    }
  }, [searchQuery, debouncedFetchMovies]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar filmes..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="gray"
      />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
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
  list: {
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 10,
    backgroundColor: "#fff",
  },
});
