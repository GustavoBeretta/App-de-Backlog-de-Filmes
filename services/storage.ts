import AsyncStorage from "@react-native-async-storage/async-storage";

export type MovieStatus = "watched" | "wantToWatch";

const WATCHED_KEY = "@watched_movies";
const WANT_TO_WATCH_KEY = "@want_to_watch_movies";
const RATED_KEY = "@rated_movies";

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

const getRatedMoviesList = async (): Promise<{ [key: number]: number }> => {
  try {
    const jsonValue = await AsyncStorage.getItem(RATED_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error("Falha ao buscar filmes avaliados do armazenamento", e);
    return {};
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

const saveRatedMovieList = async (ratedMovies: { [key: number]: number }) => {
  try {
    const jsonValue = JSON.stringify(ratedMovies);
    await AsyncStorage.setItem(RATED_KEY, jsonValue);
  } catch (e) {
    console.error("Falha ao salvar filmes avaliados no armazenamento", e);
  }
};

export interface WatchedMovie {
  id: number;
  runtime: number;
}

const getWatchedMovieList = async (): Promise<WatchedMovie[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(WATCHED_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Falha ao buscar filmes assistidos do armazenamento", e);
    return [];
  }
};

const saveWatchedMovieList = async (movies: WatchedMovie[]) => {
  try {
    const jsonValue = JSON.stringify(movies);
    await AsyncStorage.setItem(WATCHED_KEY, jsonValue);
  } catch (e) {
    console.error("Falha ao salvar filmes assistidos no armazenamento", e);
  }
};

export const toggleMovieStatus = async (
  movieId: number,
  status: MovieStatus,
  runtime?: number
) => {
  if (status === "watched") {
    const currentList = await getWatchedMovieList();
    const movieIndex = currentList.findIndex((m) => m.id === movieId);

    if (movieIndex > -1) {
      currentList.splice(movieIndex, 1);
    } else {
      if (runtime !== undefined) {
        currentList.push({ id: movieId, runtime: runtime || 0 });
      }
    }
    await saveWatchedMovieList(currentList);
  } else {
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
  }
};

export const getMovieStatus = async (
  movieId: number
): Promise<{
  watched: boolean;
  wantToWatch: boolean;
  rating: number | null;
}> => {
  const watchedMovies = await getWatchedMovieList();
  const wantToWatchMovies = await getMovieList(WANT_TO_WATCH_KEY);
  const ratedMovies = await getRatedMoviesList();

  return {
    watched: watchedMovies.some((m) => m.id === movieId),
    wantToWatch: wantToWatchMovies.includes(movieId),
    rating: ratedMovies[movieId] || null,
  };
};

export const getMoviesByStatus = async (
  status: MovieStatus
): Promise<number[]> => {
  if (status === "watched") {
    const watchedMovies = await getWatchedMovieList();
    return watchedMovies.map((m) => m.id);
  }
  return getMovieList(getStorageKey(status));
};

export const getTotalWatchedTime = async (): Promise<number> => {
  const watchedMovies = await getWatchedMovieList();
  return watchedMovies.reduce(
    (total, movie) => total + (movie.runtime || 0),
    0
  );
};

export const saveMovieRating = async (movieId: number, rating: number) => {
  const ratedMovies = await getRatedMoviesList();
  ratedMovies[movieId] = rating;
  await saveRatedMovieList(ratedMovies);
};

export const deleteMovieRating = async (movieId: number) => {
  const ratedMovies = await getRatedMoviesList();
  delete ratedMovies[movieId];
  await saveRatedMovieList(ratedMovies);
};

export const getRatedMovies = async (): Promise<{
  [key: number]: number;
}> => {
  return getRatedMoviesList();
};
