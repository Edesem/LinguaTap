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

const poem = `Tüzesen süt le a nyári nap sugára
Az ég tetejéről a juhászbojtárra.
Fölösleges dolog sütnie oly nagyon,
A juhásznak úgyis nagy melege vagyon.

Szerelem tüze ég fiatal szivében,
Ugy legelteti a nyájt a faluvégen.
Faluvégen nyája mig szerte legelész,
Ő addig subáján a fűben heverész.

Tenger virág nyílik tarkán körülötte.
De ő a virágra szemét nem vetette;
Egy kőhajtásnyira foly tőle a patak,
Bámuló szemei odatapadtanak.

De nem ám a patak csillámló habjára,
Hanem a patakban egy szőke kislyányra,
A szőke kislyánynak karcsu termetére,
Szép hosszú hajára, gömbölyű keblére.

Kisleány szoknyája térdig föl van hajtva,
Mivelhogy ruhákat mos a fris patakba';
Kilátszik a vízből két szép térdecskéje
Kukoricza Jancsi gyönyörűségére.

Mert a pázsit fölött heverésző juhász
Kukoricza Jancsi, ki is lehetne más?
Ki pedig a vízben a ruhát tisztázza,
Iluska az, Jancsi szivének gyöngyháza.`;

export default function TabOneScreen() {
  const [selectedWord, setSelectedWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const EXPO_PUBLIC_API_KEY = process.env.EXPO_PUBLIC_API_KEY;

  const fetchFromWiktionary = async (word: string) => {
    try {
      const response = await fetch(
        `https://en.wiktionary.org/w/api.php?action=query&titles=${word}&prop=extracts&explaintext=1&format=json&origin=*&uselang=hu`
      );
      const data = await response.json();
      const page = Object.values(data.query.pages)[0];

      // Return only the Hungarian definition if available
      return typeof page.extract === "string" && page.extract.length > 0
        ? page.extract
        : null;
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
