import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AlcoholCategory } from '../types';
import { recognizeTextFromImage, classifyAlcoholFromText, extractBottleName } from '../ml/textRecognition';
import { saveImageLocally } from '../utils/storage';
import { addBottle } from '../database/bottleOperations';

const categoryOptions = [
  { value: 'vodka', label: 'Vodka' },
  { value: 'whiskey', label: 'Whiskey' },
  { value: 'rum', label: 'Rum' },
  { value: 'gin', label: 'Gin' },
  { value: 'tequila', label: 'Tequila' },
  { value: 'brandy', label: 'Brandy' },
  { value: 'liqueur', label: 'Liqueur' },
  { value: 'wine', label: 'Wine' },
  { value: 'beer', label: 'Beer' },
  { value: 'other', label: 'Other' },
];

export default function AddBottleScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { photoUri } = route.params as { photoUri: string };

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AlcoholCategory>('other');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    processImage();
  }, []);

  const processImage = async () => {
    try {
      // Try OCR
      const recognizedText = await recognizeTextFromImage(photoUri);

      if (recognizedText) {
        // Extract bottle name
        const extractedName = extractBottleName(recognizedText);
        setName(extractedName);

        // Classify alcohol type
        const detectedCategory = classifyAlcoholFromText(recognizedText);
        setCategory(detectedCategory);
      }
    } catch (error) {
      console.error('OCR processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a bottle name');
      return;
    }

    try {
      setIsSaving(true);

      // Save image to permanent location
      const savedImageUri = await saveImageLocally(photoUri);

      // Add to database
      await addBottle(name, category, savedImageUri, notes || undefined);

      Alert.alert('Success', 'Bottle added to inventory!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Inventory' as never),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save bottle');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Image source={{ uri: photoUri }} style={styles.image} />

        {isProcessing && (
          <Text style={styles.processingText}>Analyzing image...</Text>
        )}

        <TextInput
          label="Bottle Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryGrid}>
          {categoryOptions.map(option => (
            <Button
              key={option.value}
              mode={category === option.value ? 'contained' : 'outlined'}
              onPress={() => setCategory(option.value as AlcoholCategory)}
              style={styles.categoryButton}
            >
              {option.label}
            </Button>
          ))}
        </View>

        <TextInput
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving || !name.trim()}
          style={styles.saveButton}
          icon="check"
        >
          Add to Inventory
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={isSaving}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  processingText: {
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 24,
  },
});
