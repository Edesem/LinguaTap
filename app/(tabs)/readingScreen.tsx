import React, { useEffect, useState } from "react";
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
import janosVitez from "../../assets/texts/poem";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function ReadingScreen() {
  const [selectedWord, setSelectedWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0); 

  const EXPO_PUBLIC_API_KEY = process.env.EXPO_PUBLIC_API_KEY;
  const colorScheme = useColorScheme(); // Get the current color scheme

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
  const styles = getStyles(colorScheme);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={colorScheme === "dark" ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>János Vitéz</Text>
        <FlatList
          data={janosVitez}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          initialScrollIndex={currentChapterIndex} // Start from the last chapter index
          renderItem={({ item, index }) => (
            <View style={{ width, height }}>
              <ScrollView contentContainerStyle={styles.chapterContainer}>
                <Text style={styles.chapterTitle}>{item.title}</Text>
                {renderPoemLines(item.content)}
              </ScrollView>
            </View>
          )}
          onMomentumScrollEnd={(e) => {
            const index = Math.floor(
              e.nativeEvent.contentOffset.x / width
            ); // Calculate the chapter index based on scroll position
            handleChapterChange(index); // Save the new chapter index
          }}
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
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      marginVertical: 20,
      color: colorScheme === "dark" ? "#ecf0f1" : "#2C3E50",
    },
    chapterContainer: {
      paddingHorizontal: 20,
      paddingBottom: 300,
    },
    chapterTitle: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 16,
      color: colorScheme === "dark" ? "#ecf0f1" : "#2C3E50",
    },
    line: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 8,
    },
    word: {
      fontSize: 18,
      color: colorScheme === "dark" ? "#bdc3c7" : "#34495E",
    },
    modalBackground: {
      flex: 1,
      backgroundColor: "#000000aa",
      justifyContent: "center",
      alignItems: "center",
    },
    modalBox: {
      width: "85%",
      backgroundColor: colorScheme === "dark" ? "#333" : "#fff",
      padding: 20,
      borderRadius: 12,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
      color: colorScheme === "dark" ? "#ecf0f1" : "#2C3E50",
    },
    modalContent: {
      fontSize: 16,
      marginBottom: 20,
      color: colorScheme === "dark" ? "#bdc3c7" : "#34495E",
    },
    closeButton: {
      color: "#007AFF",
      fontSize: 18,
      textAlign: "center",
      marginTop: 10,
    },
  });
};
