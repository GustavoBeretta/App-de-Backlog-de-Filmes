import AsyncStorage from "@react-native-async-storage/async-storage";

export type MovieStatus = "watched" | "wantToWatch";

const WATCHED_KEY = "@watched_movies";
const WANT_TO_WATCH_KEY = "@want_to_watch_movies";

const getStorageKey = (status: MovieStatus) => {
  return status === "watched" ? WATCHED_KEY : WANT_TO_WATCH_KEY;
};

const getMovieList = async (key: string): Promise<number[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Falha ao buscar filmes do armazenamento", e);
    return [];
  }
};

const saveMovieList = async (key: string, movieIds: number[]) => {
  try {
    const jsonValue = JSON.stringify(movieIds);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error("Falha ao salvar filmes no armazenamento", e);
  }
};

export const toggleMovieStatus = async (
  movieId: number,
  status: MovieStatus
) => {
  const key = getStorageKey(status);
  const currentList = await getMovieList(key);

  if (currentList.includes(movieId)) {
    await saveMovieList(
      key,
      currentList.filter((id) => id !== movieId)
    );
  } else {
    await saveMovieList(key, [...currentList, movieId]);
  }
};

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

export const getMoviesByStatus = async (
  status: MovieStatus
): Promise<number[]> => {
  return getMovieList(getStorageKey(status));
};
