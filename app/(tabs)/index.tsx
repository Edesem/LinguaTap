import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Modal,
  Text as RNText,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/Themed";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import janosVitez from "../../assets/texts/poem";


export default function TabOneScreen() {
  const [selectedWord, setSelectedWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const EXPO_PUBLIC_API_KEY = process.env.EXPO_PUBLIC_API_KEY;

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
      // First, attempt to fetch from Wiktionary
      const wiktionaryDefinition = await fetchFromWiktionary(word);

      // If Wiktionary provides a definition, use it
      if (wiktionaryDefinition) {
        setDefinition(wiktionaryDefinition);
      } else {
        // If no definition from Wiktionary, then fetch from Cohere AI
        const response = await fetch("https://api.cohere.ai/v1/chat", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${EXPO_PUBLIC_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "command",
            message: `You are an AI for an app that helps users understand old, archaic poetry much better. 
           Format your responses in a professional manner that would make the app be appealing.

           What does the Hungarian word "${word}" mean? The context is the epic poem being read is János Vitéz.
           Keep it brief, show etymology if you know it. 
           State whether it's archaic, old, formal, informal, literature, colloquial, dialectal, etc.`,
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

  const renderPoem = () => {
    return poem.split("\n").map((line, i) => (
      <View key={i} style={styles.line}>
        {line.split(" ").map((word, j) => {
          const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'’"]/g, "");
          return (
            <TouchableOpacity
              key={j}
              onPress={() => handleWordPress(cleanWord)}
            >
              <Text style={styles.word}>{word} </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>János Vitéz</Text>
          <View style={styles.poemContainer}>{renderPoem()}</View>

          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalBackground}>
              <View style={styles.modalBox}>
                <RNText style={styles.modalTitle}>{selectedWord}</RNText>
                <ScrollView>
                  {loading ? (
                    <ActivityIndicator
                      size="large"
                      color="#007AFF"
                      style={{ marginTop: 20 }}
                    />
                  ) : (
                    <RNText style={styles.modalContent}>{definition}</RNText>
                  )}
                </ScrollView>

                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <RNText style={styles.closeButton}>Close</RNText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2C3E50",
  },
  poemContainer: {
    marginBottom: 20,
  },
  line: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  word: {
    fontSize: 18,
    color: "#34495E",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    color: "#007AFF",
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
  },
});
