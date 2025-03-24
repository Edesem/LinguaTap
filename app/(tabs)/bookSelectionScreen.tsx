import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function BookSelectionScreen() {
  const { language } = useLocalSearchParams();
  const router = useRouter();

  const availableBooks = {
    English: ['Book 1', 'Book 2'],
    Hungarian: ['János Vitéz - Petőfi Sándor', 'Toldi - Arany János'],
    Romanian: ['Book X', 'Book Y'],
  };

  const handleBookSelect = (book: string) => {
    router.push({
      pathname: '/(tabs)/readingScreen',
      params: { book },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Book in {language}</Text>
      {availableBooks[language as keyof typeof availableBooks]?.map((book) => (
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
