import AsyncStorage from "@react-native-async-storage/async-storage";

export type MovieStatus = "watched" | "wantToWatch";

const WATCHED_KEY = "@watched_movies";
const WANT_TO_WATCH_KEY = "@want_to_watch_movies";

const getStorageKey = (status: MovieStatus) => {
  return status === "watched" ? WATCHED_KEY : WANT_TO_WATCH_KEY;
};

// Helper function to get movies from a list
const getMovieList = async (key: string): Promise<number[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to fetch movies from storage", e);
    return [];
  }
};

// Helper function to save movies to a list
const saveMovieList = async (key: string, movieIds: number[]) => {
  try {
    const jsonValue = JSON.stringify(movieIds);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error("Failed to save movies to storage", e);
  }
};

// Toggles a movie's status. If it has the status, it's removed. If not, it's added.
export const toggleMovieStatus = async (
  movieId: number,
  status: MovieStatus
) => {
  const key = getStorageKey(status);
  const currentList = await getMovieList(key);

  if (currentList.includes(movieId)) {
    // Remove from current list
    await saveMovieList(
      key,
      currentList.filter((id) => id !== movieId)
    );
  } else {
    // Add to current list
    await saveMovieList(key, [...currentList, movieId]);
  }
};

// Checks the status of a single movie
export const getMovieStatus = async (
  movieId: number
): Promise<{ watched: boolean; wantToWatch: boolean }> => {
  const watchedMovies = await getMovieList(WATCHED_KEY);
  const wantToWatchMovies = await getMovieList(WANT_TO_WATCH_KEY);

  return {
    watched: watchedMovies.includes(movieId),
    wantToWatch: wantToWatchMovies.includes(movieId),
  };
};

// Gets all movie IDs for a given status
export const getMoviesByStatus = async (
  status: MovieStatus
): Promise<number[]> => {
  return getMovieList(getStorageKey(status));
};
