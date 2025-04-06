import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';

// Importing the books content
import { janosVitez } from '@/assets/texts/János Vitéz - Petőfi Sándor';
import { toldi } from '@/assets/texts/Toldi - Arany János';

export default function LibraryScreen() {
  const router = useRouter();

  const availableLanguages = ['English', 'Hungarian', 'Romanian'];
  const availableBooks = {
    English: ['Book 1', 'Book 2'],
    Hungarian: ['János Vitéz - Petőfi Sándor', 'Toldi - Arany János'],
    Romanian: ['Book X', 'Book Y'],
  };

  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = availableLanguages.filter((lang) =>
    lang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setModalVisible(false);
  };

  const handleBookSelect = (book: string) => {
    // Dynamically import the book content
    let bookContent;
    if (book === 'János Vitéz - Petőfi Sándor') {
      bookContent = toldi
    } else if (book === 'Toldi - Arany János') {
      bookContent = janosVitez
    }

    // Navigate to the 'read' page with book content
    if (bookContent) {
      router.push({
        pathname: '/(tabs)/read',
        params: { book: bookContent },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library</Text>

      {/* Language Selection */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          {selectedLanguage ? `Language: ${selectedLanguage}` : 'Select Language'}
        </Text>
      </TouchableOpacity>

      {/* Book Selection */}
      {selectedLanguage && (
        <FlatList
          data={availableBooks[selectedLanguage]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookItem}
              onPress={() => handleBookSelect(item)}
            >
              <Text style={styles.bookText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Language Selection Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search languages..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <FlatList
            data={filteredLanguages}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleLanguageSelect(item)}
                style={styles.languageItem}
              >
                <Text style={styles.languageText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: 'white' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  bookItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bookText: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  searchInput: {
    fontSize: 18,
    padding: 10,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  languageItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  languageText: {
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});
