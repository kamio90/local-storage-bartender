import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Chip, ProgressBar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AlcoholCategory } from '../types';
import { processBottleImage } from '../ml/textRecognition';
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
  const [confidence, setConfidence] = useState(0);
  const [detectedInfo, setDetectedInfo] = useState<string>('');

  useEffect(() => {
    processImage();
  }, []);

  const processImage = async () => {
    try {
      // Use enhanced OCR with confidence scoring
      const result = await processBottleImage(photoUri);

      if (result.extractedName) {
        setName(result.extractedName);
      }

      if (result.classification.category !== 'other') {
        setCategory(result.classification.category);
      }

      setConfidence(result.confidence);

      // Build info message
      if (result.confidence > 0) {
        const parts = [];
        if (result.extractedName) {
          parts.push(`Name: ${result.extractedName}`);
        }
        if (result.classification.matchedKeyword) {
          parts.push(`Detected: ${result.classification.matchedKeyword}`);
        }
        setDetectedInfo(parts.join(' • '));
      } else {
        setDetectedInfo('Could not detect text - please enter manually');
      }
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

  const getConfidenceColor = () => {
    if (confidence >= 0.7) return '#4CAF50';
    if (confidence >= 0.4) return '#FF9800';
    return '#F44336';
  };

  const getConfidenceLabel = () => {
    if (confidence >= 0.7) return 'High Confidence';
    if (confidence >= 0.4) return 'Medium Confidence';
    if (confidence > 0) return 'Low Confidence';
    return 'Manual Entry Required';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Image source={{ uri: photoUri }} style={styles.image} />

        {isProcessing ? (
          <>
            <Text style={styles.processingText}>Analyzing image with local AI...</Text>
            <ProgressBar indeterminate style={styles.progressBar} />
          </>
        ) : (
          <>
            {confidence > 0 && (
              <View style={styles.confidenceSection}>
                <View style={styles.confidenceHeader}>
                  <Chip
                    mode="flat"
                    style={{ backgroundColor: getConfidenceColor() }}
                    textStyle={{ color: 'white' }}
                  >
                    {getConfidenceLabel()}
                  </Chip>
                  <Text style={styles.confidenceText}>
                    {Math.round(confidence * 100)}%
                  </Text>
                </View>
                {detectedInfo && (
                  <Text style={styles.detectedInfo}>{detectedInfo}</Text>
                )}
              </View>
            )}
            {confidence === 0 && (
              <View style={styles.manualEntryBanner}>
                <Text style={styles.manualEntryText}>
                  ℹ️ {detectedInfo}
                </Text>
              </View>
            )}
          </>
        )}

        <TextInput
          label="Bottle Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          placeholder="Enter bottle name"
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
    marginBottom: 8,
    fontStyle: 'italic',
  },
  progressBar: {
    marginBottom: 16,
  },
  confidenceSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detectedInfo: {
    fontSize: 13,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  manualEntryBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  manualEntryText: {
    color: '#856404',
    fontSize: 14,
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
