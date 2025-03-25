import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  // Simulating user's last read book and recently read books
  const [lastRead, setLastRead] = useState('János Vitéz - Petőfi Sándor');
  const [recentBooks, setRecentBooks] = useState([
    'János Vitéz - Petőfi Sándor',
    'Toldi - Arany János',
    'Book 1',
  ]);

  const quotes = [
    '"A könyv a lélek tápláléka." - Unknown',
    '"A journey of a thousand miles begins with a single step." - Lao Tzu',
    '"Not all those who wander are lost." - J.R.R. Tolkien',
  ];
  
  const [randomQuote, setRandomQuote] = useState('');

  useEffect(() => {
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  // Function to navigate to the last read book
  const handleContinueReading = () => {
    router.push({
      pathname: '/(tabs)/read',
      params: { book: lastRead },
    });
  };

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <Text style={styles.title}>Welcome Back! 📖</Text>

      {/* Continue Reading Section */}
      {lastRead && (
        <TouchableOpacity style={styles.continueButton} onPress={handleContinueReading}>
          <Text style={styles.continueText}>📚 Continue Reading: {lastRead}</Text>
        </TouchableOpacity>
      )}

      {/* Recently Read Books */}
      <Text style={styles.sectionTitle}>Recently Read</Text>
      <FlatList
        data={recentBooks}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.bookItem} onPress={() => router.push({ pathname: '/(tabs)/read', params: { book: item } })}>
            <Text style={styles.bookText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Random Featured Quote */}
      <Text style={styles.quote}>{randomQuote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bookItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bookText: {
    fontSize: 18,
    color: '#007AFF',
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 30,
    color: '#555',
  },
});
