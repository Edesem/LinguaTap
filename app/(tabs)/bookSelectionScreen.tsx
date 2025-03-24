import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function BookSelectionScreen({ route, navigation }) {
  const { language } = route.params;

  // Example books per language
  const availableBooks = {
    English: ['Book 1', 'Book 2'],
    Hungarian: ['Book A', 'Book B'],
    Romanian: ['Book X', 'Book Y'],
  };

  const handleBookSelect = (book: string) => {
    // Navigate to the "Read" screen, passing the selected book
    navigation.navigate('Read', { book });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Book in {language}</Text>
      {availableBooks[language]?.map((book) => (
        <TouchableOpacity key={book} onPress={() => handleBookSelect(book)}>
          <Text style={styles.bookOption}>{book}</Text>
        </TouchableOpacity>
      ))}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  bookOption: {
    fontSize: 20,
    marginVertical: 10,
    color: '#007AFF',
  },
});
