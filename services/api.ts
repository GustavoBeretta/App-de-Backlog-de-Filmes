import axios from "axios";

const API_KEY = "4aaaa1c529b85bbfd3728f77d64a0f1a";
const API_BASE_URL = "https://api.themoviedb.org/3";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  params: {
    api_key: API_KEY,
    language: "pt-BR",
  },
});

export const getPopularMovies = async () => {
  try {
    const response = await apiClient.get("/movie/popular");
    return response.data.results;
  } catch (error) {
    console.error("Erro ao buscar filmes populares:", error);
    return [];
  }
};

export const searchMovies = async (query: string) => {
  if (!query) {
    return getPopularMovies();
  }
  try {
    const response = await apiClient.get("/search/movie", {
      params: {
        query,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Erro ao buscar filmes:", error);
    return [];
  }
};

export const getMovieDetails = async (id: number) => {
  try {
    const response = await apiClient.get(`/movie/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar detalhes do filme:", error);
    return null;
  }
};

export const getMoviesDetails = async (ids: number[]) => {
  try {
    const requests = ids.map((id) => apiClient.get(`/movie/${id}`));
    const responses = await Promise.all(requests);
    return responses.map((response) => response.data);
  } catch (error) {
    console.error("Erro ao buscar detalhes dos filmes:", error);
    return [];
  }
};
