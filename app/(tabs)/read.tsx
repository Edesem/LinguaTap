import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLocalSearchParams } from 'expo-router';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  Modal,
  Text as RNText,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
  StatusBar,
} from "react-native";
import { Text } from "@/components/Themed";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book } from "../../constants/types"; // Adjust according to your file structure
import { useDebouncedCallback } from "use-debounce";
import * as yaml from 'js-yaml';


const { width, height } = Dimensions.get("window");

export default function ReadingScreen() {
  const { bookUrl } = useLocalSearchParams<{ bookUrl: string }>();

  const [bookContent, setBookContent] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0); // To store the scroll position
  const [lastSavedPosition, setLastSavedPosition] = useState(0);
  const scrollViewRef = useRef<ScrollView | null>(null); // Ref to the ScrollView

  const EXPO_PUBLIC_API_KEY = process.env.EXPO_PUBLIC_API_KEY;
  const colorScheme = useColorScheme();

  // Fetch and parse YAML file
  useEffect(() => {
    const loadBookContent = async () => {
      if (bookUrl) {
        try {
          const response = await fetch(bookUrl);
          if (response.ok) {
            const rawYAML = await response.text();  // Get the raw YAML as text
            console.log("Fetched YAML:", rawYAML);

            const book = yaml.load(rawYAML);  // Parse the YAML to a JS object
            console.log("Parsed Book Object:", book);

            if (book && book.content) {
              setBookContent(book);  // Set the parsed content
            } else {
              console.error("Invalid book content format.");
            }
          } else {
            console.error("Failed to fetch content, status:", response.status);
          }
        } catch (error) {
          console.error("Error loading book content:", error);
        }
      }
    };

    loadBookContent();
  }, [bookUrl]);


  // Debounced save function to save scroll position after the user stops scrolling
  const debouncedSave = useDebouncedCallback(
    (yPosition: number) => {
      // Save the scroll position with debounce
      if (Math.abs(yPosition - lastSavedPosition) >= 10) {
        setScrollPosition(yPosition);
        setLastSavedPosition(yPosition); // Update the last saved position
        AsyncStorage.setItem(`scrollPosition_${currentChapterIndex}`, yPosition.toString());
      }
    },
    1000 // Delay of 1 second
  );

  useEffect(() => {
    const getLastChapterAndPosition = async () => {
      try {
        const lastChapter = await AsyncStorage.getItem("lastChapter");
        if (lastChapter !== null) {
          setCurrentChapterIndex(parseInt(lastChapter, 10));
        }
      } catch (error) {
        console.error("Error retrieving last chapter:", error);
      }
    };

    getLastChapterAndPosition();
  }, []);

  useEffect(() => {
    const loadScrollPosition = async () => {
      try {
        // Load the scroll position for the current chapter after it's updated
        const savedPosition = await AsyncStorage.getItem(`scrollPosition_${currentChapterIndex}`);
        if (savedPosition !== null) {
          setScrollPosition(parseInt(savedPosition, 10)); // Set the saved scroll position for the chapter
          setLastSavedPosition(parseInt(savedPosition, 10)); // Update the last saved position
        } else {
          setScrollPosition(0); // If no saved position, start at the top
        }
      } catch (error) {
        console.error("Error retrieving scroll position:", error);
      }
    };

    if (currentChapterIndex !== null) {
      loadScrollPosition();
    }
  }, [currentChapterIndex]); // This effect runs when the chapter changes

  const handleChapterChange = async (index: number) => {
    // Save the current chapter index before the change
    await AsyncStorage.setItem("lastChapter", index.toString());

    // Reset the scroll position for the new chapter once it's loaded
    setCurrentChapterIndex(index);
    setScrollPosition(0); // Reset scroll position for the new chapter
    setLastSavedPosition(0); // Reset the last saved position
  };

  const handleScroll = (event: any) => {
    const yPosition = event.nativeEvent.contentOffset.y;
    debouncedSave(yPosition); // Call the debounced save function
  };

  const renderPoemLines = (text: string) => {
    return text.split("\n").map((line, i) => (
      <View key={i} style={styles.line}>
        {line.split(" ").map((word, j) => {
          const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'’"]/g, "");
          return (
            <TouchableOpacity key={j} onPress={() => handleWordPress(cleanWord)}>
              <Text style={styles.word}>{word} </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  // Apply dark or light mode styles based on color scheme
  const styles = useMemo(() => getStyles(colorScheme), [colorScheme]);

  // Check if the book content is available
  if (!bookContent) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={colorScheme === "dark" ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{bookContent.title}</Text>
        <Text style={styles.author}>By {bookContent.author}</Text>

        <FlatList
          data={bookContent.content}  // Use the 'content' array to render chapters
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          initialScrollIndex={currentChapterIndex}
          renderItem={({ item, index }) => (
            <View style={{ width, height }}>
              <ScrollView
                contentContainerStyle={styles.chapterContainer}
                ref={scrollViewRef}
                onScroll={handleScroll} // Attach scroll handler
                scrollEventThrottle={16} // Update scroll position at 60fps
                contentOffset={{ x: 0, y: scrollPosition }} // Provide both x and y values
              >
                {/* Title and Author inside each chapter */}
                {index === 0 && (
                  <>
                    <Text style={styles.chapterTitle}>{item.title}</Text>
                    <Text style={styles.chapterContent}>{item.content}</Text>
                  </>
                )}
              </ScrollView>
            </View>
          )}
          onMomentumScrollEnd={(e) => {
            const index = Math.floor(e.nativeEvent.contentOffset.x / width);
            handleChapterChange(index);
          }}
          getItemLayout={(data, index) => ({
            length: width, // Each item has the same width as the screen
            offset: width * index, // Offset is the position of the item
            index, // The index of the item
          })}
          initialNumToRender={1}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

  // Styles for both light and dark mode
  const getStyles = (colorScheme) => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#121212" : "#f7f7f7",
      },
      title: {
        fontSize: 32,
        fontWeight: "700",
        textAlign: "center",
        marginVertical: 25,
        color: colorScheme === "dark" ? "#ecf0f1" : "#2C3E50",
        letterSpacing: 1,
      },
      author: {
        fontSize: 20,
        fontWeight: "300",
        textAlign: "center",
        color: colorScheme === "dark" ? "#bdc3c7" : "#34495E",
        marginBottom: 20,
      },
      chapterContainer: {
        paddingHorizontal: 20,
        paddingBottom: 200,
        flexDirection: "column",
        justifyContent: "center",
      },
      chapterTitle: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 20,
        paddingTop: 30,
        color: colorScheme === "dark" ? "#ecf0f1" : "#2C3E50",
        borderBottomWidth: 1,
        borderBottomColor: colorScheme === "dark" ? "#444" : "#DDD",
        paddingBottom: 10,
      },
      line: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 8,
        marginHorizontal: 10,
      },
      word: {
        fontSize: 20,
        color: colorScheme === "dark" ? "#bdc3c7" : "#34495E",
        paddingHorizontal: 1.2,
        fontFamily: "Georgia, serif",
      },
      modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      },
      modalBox: {
        width: 300,
        padding: 20,
        backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff",
        borderRadius: 10,
        alignItems: "center",
      },
      modalTitle: {
        fontSize: 22,
        fontWeight: "600",
        color: colorScheme === "dark" ? "#ecf0f1" : "#2C3E50",
      },
      modalContent: {
        marginTop: 20,
        fontSize: 16,
        color: colorScheme === "dark" ? "#ecf0f1" : "#2C3E50",
        textAlign: "center",
      },
      closeButton: {
        marginTop: 20,
        fontSize: 16,
        color: "#007AFF",
      },
    });
  };
