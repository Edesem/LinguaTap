import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';

export default function Index({ navigation }: { navigation: any }) {
  const availableLanguages = [
    'English', 'Hungarian', 'Romanian'
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = availableLanguages.filter((lang) =>
    lang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLanguageSelect = (language: string) => {
    setModalVisible(false);
    router.push({
      pathname: '/library',
      params: { language },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Language</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Choose Language</Text>
      </TouchableOpacity>

      {/* Modal with searchable list */}
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
    justifyContent: 'center',
    paddingHorizontal: 20,
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
  },
  buttonText: {
    color: '#fff',
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
