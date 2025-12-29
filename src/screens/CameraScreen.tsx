import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Button, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const navigation = useNavigation();

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission to scan bottles</Text>
        <Button mode="contained" onPress={requestPermission}>
          Grant Permission
        </Button>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync();

      if (photo?.uri) {
        // Navigate to add bottle screen with photo
        navigation.navigate('AddBottle' as never, { photoUri: photo.uri } as never);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate('AddBottle' as never, { photoUri: result.assets[0].uri } as never);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error(error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <Button
              mode="contained-tonal"
              onPress={() => navigation.goBack()}
              icon="close"
            >
              Close
            </Button>
          </View>

          <View style={styles.bottomBar}>
            <Button
              mode="contained"
              onPress={pickImage}
              icon="image"
              style={styles.button}
            >
              Gallery
            </Button>

            <Button
              mode="contained"
              onPress={takePicture}
              disabled={isProcessing}
              loading={isProcessing}
              icon="camera"
              style={[styles.button, styles.captureButton]}
            >
              {isProcessing ? 'Processing...' : 'Capture'}
            </Button>

            <Button
              mode="contained"
              onPress={toggleCameraFacing}
              icon="camera-flip"
              style={styles.button}
            >
              Flip
            </Button>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topBar: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'flex-end',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  captureButton: {
    flex: 2,
  },
});
