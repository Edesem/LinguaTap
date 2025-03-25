import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';

const bookmarksData = [
  { id: '1', title: 'Chapter 1: Introduction' },
  { id: '2', title: 'Chapter 2: Beginning' },
  { id: '3', title: 'Chapter 3: Development' },
  // Add more bookmark data as needed
];

export default function Bookmarks({ navigation }: { navigation: any }) {
  const handleBookmarkSelect = (bookmark: string) => {
    // Navigate to the page/section of the bookmark
    navigation.navigate('Read', { bookmark });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Previously Reading</Text>
      <FlatList
        data={bookmarksData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleBookmarkSelect(item.title)}
            style={styles.bookmarkItem}
          >
            <Text style={styles.bookmarkText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
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
  bookmarkItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  bookmarkText: {
    fontSize: 18,
  },
});
