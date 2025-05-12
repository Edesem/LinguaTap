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

import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../firebaseConfig'; // Import your firebase configuration

type Book = {
  name: string;
  path: string;
};

export default function LibraryScreen() {
  const router = useRouter();

  const availableLanguages = ['English', 'Hungarian', 'Romanian'];
  const availableBooks: Record<string, Book[]> = {
    English: [],
    Hungarian: [],
    Romanian: [],
  };

  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<Book[]>([]);

  const filteredLanguages = availableLanguages.filter((lang) =>
    lang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setModalVisible(false);
    fetchBooks(language);  // Fetch books whenever a language is selected
  };

  // Fetch the list of books from Firebase Storage
  const fetchBooks = async (language: string) => {
    try {
      const booksRef = ref(storage, `books/${language}/`);  // Assuming each language has its own directory
      const listResult = await listAll(booksRef);
      const booksList: Book[] = listResult.items.map(item => ({
        name: item.name.replace('.ts', ''), // Remove the file extension
        path: item.fullPath, // Full path of the file in Firebase Storage
      }));
      availableBooks[language] = booksList;
      setBooks(booksList);  // Set books to state to trigger re-render
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchBookContent = async (bookPath: string) => {
    try {
      const bookRef = ref(storage, bookPath);
      const url = await getDownloadURL(bookRef);
      return url;
    } catch (error) {
      console.error('Error fetching book:', error);
    }
  };

  const handleBookSelect = async (book: Book) => {
    const bookContentUrl = await fetchBookContent(book.path);
    console.log(bookContentUrl)
    if (bookContentUrl) {
      router.push({
        pathname: '/(tabs)/read',
        params: { bookUrl: encodeURI(bookContentUrl) },
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
          data={books}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookItem}
              onPress={() => handleBookSelect(item)}
            >
              <Text style={styles.bookText}>{item.name}</Text>
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