import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function Index({ navigation }: { navigation: any }) {
  const availableLanguages = ['English', 'Hungarian', 'Romanian']; // Example languages

  const handleLanguageSelect = (language: string) => {
    // Navigate to the book selection screen
    navigation.navigate('bookSelectionScreen', { language });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Language</Text>
      {availableLanguages.map((language) => (
        <TouchableOpacity key={language} onPress={() => handleLanguageSelect(language)}>
          <Text style={styles.languageOption}>{language}</Text>
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
  languageOption: {
    fontSize: 20,
    marginVertical: 10,
    color: '#007AFF',
  },
});
