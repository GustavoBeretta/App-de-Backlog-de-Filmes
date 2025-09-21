import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import * as Calendar from "expo-calendar";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
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
  const [date, setDate] = useState(new Date());
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [showIOSPicker, setShowIOSPicker] = useState(false);

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

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowIOSPicker(Platform.OS === "ios");
    setDate(currentDate);

    if (Platform.OS === "android") {
      if (event.type === "set") {
        DateTimePickerAndroid.open({
          value: currentDate,
          onChange: async (timeEvent, timeSelectedDate) => {
            if (timeEvent.type === "set" && timeSelectedDate) {
              const finalDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate(),
                timeSelectedDate.getHours(),
                timeSelectedDate.getMinutes()
              );
              await createCalendarEvent(finalDate);
            }
          },
          mode: "time",
          is24Hour: true,
        });
      }
    }
  };

  const handleConfirmIOS = async () => {
    setShowIOSPicker(false);
    await createCalendarEvent(date);
  };

  const showDatepicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: date,
        onChange,
        mode: "date",
        minimumDate: new Date(),
      });
    } else {
      setShowIOSPicker(true);
    }
  };

  async function getDefaultCalendarSource(): Promise<Calendar.Source | null> {
    if (Platform.OS === "ios") {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      return defaultCalendar.source;
    }

    // On Android, find a writable source, prioritizing Google Calendar
    const sources = await Calendar.getSourcesAsync();
    const googleSource = sources.find(
      (source) =>
        source.name?.toLowerCase() === "google" &&
        source.type === Calendar.SourceType.CALDAV
    );
    if (googleSource) {
      return googleSource;
    }

    // Fallback for other account types or local calendars
    const writableSource = sources.find(
      (source) => source.type !== Calendar.SourceType.BIRTHDAYS
    );
    return writableSource || (sources.length > 0 ? sources[0] : null);
  }

  async function getCalendarId(): Promise<string | null> {
    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );
    const writableCalendars = calendars.filter(
      (cal) => cal.allowsModifications
    );

    if (writableCalendars.length > 0) {
      // Prioritize finding a Google calendar
      const googleCalendar = writableCalendars.find(
        (cal) =>
          cal.source.name?.toLowerCase() === "google" ||
          cal.ownerAccount?.toLowerCase().endsWith("@gmail.com") ||
          cal.ownerAccount?.toLowerCase().endsWith("@google.com")
      );
      if (googleCalendar) {
        return googleCalendar.id;
      }

      // Fallback to primary calendar if no Google calendar is found
      const primaryCalendar = writableCalendars.find((cal) => cal.isPrimary);
      if (primaryCalendar) {
        return primaryCalendar.id;
      }

      // Otherwise, return the first writable calendar
      return writableCalendars[0].id;
    }

    // If no writable calendar is found, try to create one
    const source = await getDefaultCalendarSource();
    if (source) {
      return createNewCalendar(source);
    }

    // As a last resort, if no source was found either,
    // try to get sources again and create a calendar with the first one.
    const allSources = await Calendar.getSourcesAsync();
    if (allSources.length > 0) {
      // Prefer Google source for creation
      const googleSource = allSources.find(
        (s) => s.name?.toLowerCase() === "google"
      );
      return createNewCalendar(googleSource || allSources[0]);
    }

    return null;
  }

  async function createNewCalendar(
    source: Calendar.Source
  ): Promise<string | null> {
    const ownerAccount =
      source.name === "local" ? "personal" : source.name || "movieAppCalendar";
    try {
      const newCalendarID = await Calendar.createCalendarAsync({
        title: "Lembretes de Filmes",
        color: "blue",
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: source.id,
        name: "movieAppCalendar",
        ownerAccount: ownerAccount,
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });
      return newCalendarID;
    } catch (e) {
      console.error("Failed to create calendar:", e);
      alert(
        "Failed to create a new calendar. Please ensure you have a calendar account set up on your device."
      );
      return null;
    }
  }

  async function createCalendarEvent(selectedDate: Date) {
    if (!movie) return;
    setIsCreatingEvent(true);

    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      alert("Permissão para acessar o calendário é necessária.");
      setIsCreatingEvent(false);
      return;
    }

    const calendarId = await getCalendarId();
    if (!calendarId) {
      alert("Nenhum calendário gravável encontrado ou criado.");
      setIsCreatingEvent(false);
      return;
    }

    const eventDetails = {
      title: `Assistir: ${movie.title}`,
      startDate: selectedDate,
      endDate: new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000),
      notes: `Lembrete para assistir ao filme "${movie.title}".\n\nSinopse: ${movie.overview}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    try {
      await Calendar.createEventAsync(calendarId, eventDetails);
      alert("Lembrete criado com sucesso no seu calendário!");
    } catch (error) {
      console.error("Erro ao criar evento: ", error);
      alert("Ocorreu um erro ao criar o lembrete.");
    } finally {
      setIsCreatingEvent(false);
    }
  }

  const addReminder = () => {
    showDatepicker();
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
        </View>
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
        <TouchableOpacity
          style={styles.reminderButton}
          onPress={addReminder}
          disabled={isCreatingEvent}
        >
          {isCreatingEvent ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.reminderButtonText}>Adicionar Lembrete</Text>
          )}
        </TouchableOpacity>

        {Platform.OS === "ios" && showIOSPicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showIOSPicker}
            onRequestClose={() => setShowIOSPicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  onChange={onChange}
                  display="inline"
                  style={styles.iosPicker}
                  themeVariant="light"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowIOSPicker(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleConfirmIOS}
                  >
                    <Text style={styles.modalButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
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
    alignItems: "center",
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
    alignItems: "center",
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  releaseDate: {
    fontSize: 14,
    color: "#000",
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    color: "#000",
    marginTop: 4,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonActive: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },
  buttonTextActive: {
    color: "#fff",
  },
  reminderButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  reminderButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
  },
  iosPicker: {
    height: 200,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
  },
  modalButtonText: {
    color: "#007bff",
    fontSize: 16,
  },
});
