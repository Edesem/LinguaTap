import React, { useEffect, useState, useMemo } from "react";
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
import toldi from "@/assets/texts/Toldi - Arany János";

const { width, height } = Dimensions.get("window");

export default function ReadingScreen() {
  const [selectedWord, setSelectedWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const EXPO_PUBLIC_API_KEY = process.env.EXPO_PUBLIC_API_KEY;
  const colorScheme = useColorScheme();

  

  useEffect(() => {
    // Retrieve the last chapter from AsyncStorage when the component mounts
    const getLastChapter = async () => {
      try {
        const lastChapter = await AsyncStorage.getItem("lastChapter");
        if (lastChapter !== null) {
          setCurrentChapterIndex(parseInt(lastChapter, 10)); // Set the last chapter index
        }
      } catch (error) {
        console.error("Error retrieving last chapter:", error);
      }
    };
    getLastChapter();
  }, []);

  const handleChapterChange = async (index: number) => {
    try {
      await AsyncStorage.setItem("lastChapter", index.toString()); // Save the current chapter index
      setCurrentChapterIndex(index); // Update state with the new chapter index
    } catch (error) {
      console.error("Error saving last chapter:", error);
    }
  };

  const extractHungarianDefinition = (content: string): string | null => {
    const lines = content.split("\n");
    const startIndex = lines.findIndex((line) => line.includes("==Hungarian=="));
    if (startIndex === -1) return null;

    const endIndex = lines.findIndex(
      (line, idx) => idx > startIndex && /^==[^=]+==/.test(line)
    );

    const hungarianLines = lines.slice(startIndex + 1, endIndex !== -1 ? endIndex : undefined);
    return hungarianLines.join("\n");
  };

  const fetchFromWiktionary = async (word: string) => {
    try {
      const response = await fetch(
        `https://en.wiktionary.org/w/api.php?action=query&titles=${word}&prop=revisions&rvprop=content&format=json&origin=*`
      );
      const data = await response.json();
      const page = Object.values(data.query.pages)[0];

      if (!page.revisions || !page.revisions[0]["*"]) return null;

      const content = page.revisions[0]["*"];
      const hungarianSection = extractHungarianDefinition(content);

      return hungarianSection || null;
    } catch (err) {
      console.error("Wiktionary fetch error:", err);
      return null;
    }
  };

  const handleWordPress = async (word: string) => {
    setSelectedWord(word);
    setDefinition("");
    setModalVisible(true);
    setLoading(true);

    try {
      const wiktionaryDefinition = await fetchFromWiktionary(word);

      if (wiktionaryDefinition) {
        setDefinition(wiktionaryDefinition);
      } else {
        const response = await fetch("https://api.cohere.ai/v1/chat", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${EXPO_PUBLIC_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "command",
            message: `You are an AI for an app that helps users understand old, archaic poetry. What does the Hungarian word "${word}" mean in János Vitéz? Keep it brief, show etymology if known, and note register.`,
          }),
        });

        const data = await response.json();
        setDefinition(data.text?.trim() || "No definition found.");
      }
    } catch (error) {
      console.error("Error:", error);
      setDefinition("Failed to fetch meaning.");
    } finally {
      setLoading(false);
    }
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

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={colorScheme === "dark" ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{toldi.title}</Text>
        <Text style={styles.author}>By {toldi.author}</Text>

        <FlatList
          data={toldi.content} // Use the content array from toldi
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          initialScrollIndex={currentChapterIndex}
          renderItem={({ item, index }) => (
            <View style={{ width, height }}>
              <ScrollView contentContainerStyle={styles.chapterContainer}>
                {item.title ? (
                  <Text style={styles.chapterTitle}>{item.title}</Text>
                ) : null}
                {renderPoemLines(item.content)}
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

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalBox}>
              <RNText style={styles.modalTitle}>{selectedWord}</RNText>
              {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
              ) : (
                <RNText style={styles.modalContent}>{definition}</RNText>
              )}
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <RNText style={styles.closeButton}>Close</RNText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
      paddingBottom: 300,
      flexDirection: "column",
      justifyContent: "center",
    },
    chapterTitle: {
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 20,
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
