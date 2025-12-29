import * as FileSystem from 'expo-file-system';

export const saveImageLocally = async (sourceUri: string): Promise<string> => {
  const filename = `bottle_${Date.now()}.jpg`;
  const destPath = `${FileSystem.documentDirectory}${filename}`;

  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destPath,
    });

    return destPath;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
};

export const deleteImage = async (uri: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
