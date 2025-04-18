import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';

interface ImagePickerInputProps {
  initialImageUrl: string | null;
  onImageChange: (imageData: ImageData | null) => void;
}

export interface ImageData {
  uri: string;
  base64?: string | null;
  fileName?: string;
  type?: string;
  isChanged: boolean;
}

export default function ImagePickerInput({
  initialImageUrl,
  onImageChange,
}: ImagePickerInputProps) {
  const [imageData, setImageData] = useState<ImageData | null>(
    initialImageUrl
      ? {
          uri: initialImageUrl,
          isChanged: false,
        }
      : null
  );
  const [loading, setLoading] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();

  const handleImagePress = () => {
    if (imageData) {
      // If we already have an image, show edit/remove options
      showEditRemoveOptions();
    } else {
      // If no image, show options to add one
      showAddImageOptions();
    }
  };

  const showAddImageOptions = () => {
    const options = ['Take Photo', 'Choose from Gallery', 'Cancel'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        title: 'Add Patient Photo',
        options,
        cancelButtonIndex,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            await handleTakePhoto();
            break;
          case 1:
            await handleChooseFromGallery();
            break;
        }
      }
    );
  };

  const showEditRemoveOptions = () => {
    const options = ['Edit Photo', 'Remove Photo', 'Cancel'];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        title: 'Manage Patient Photo',
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
        destructiveColor: '#e53935', // Red color for Remove Photo
        containerStyle: { backgroundColor: '#f8f8f8' },
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case 0: // Edit Photo
            showAddImageOptions();
            break;
          case 1: // Remove Photo
            handleRemoveImage();
            break;
        }
      }
    );
  };

  const handleTakePhoto = async () => {
    // Request camera permission only when needed
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      showCameraPermissionAlert();
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const newImageData: ImageData = {
          uri: asset.uri,
          base64: asset.base64,
          fileName: `patient_image_${Date.now()}.jpg`,
          type: 'image/jpeg',
          isChanged: true,
        };
        setImageData(newImageData);
        onImageChange(newImageData);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseFromGallery = async () => {
    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      showGalleryPermissionAlert();
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const newImageData: ImageData = {
          uri: asset.uri,
          base64: asset.base64,
          fileName: `patient_image_${Date.now()}.jpg`,
          type: 'image/jpeg',
          isChanged: true,
        };
        setImageData(newImageData);
        onImageChange(newImageData);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    } finally {
      setLoading(false);
    }
  };

  const showCameraPermissionAlert = () => {
    const options = ['Open Settings', 'Cancel'];
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        title: 'Camera Permission Required',
        message: 'Please grant camera permission to take a photo',
        options,
        cancelButtonIndex,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
          // Open settings
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        }
      }
    );
  };

  const showGalleryPermissionAlert = () => {
    const options = ['Open Settings', 'Cancel'];
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        title: 'Gallery Permission Required',
        message: 'Please grant photo library access to select images',
        options,
        cancelButtonIndex,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
          // Open settings
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        }
      }
    );
  };

  const handleRemoveImage = () => {
    setImageData(null);
    onImageChange(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Patient Photo</Text>
      <Text style={styles.hint}>Add a photo of the patient (optional)</Text>

      <View style={styles.imageContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={Colors.primary} />
          </View>
        ) : imageData ? (
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={handleImagePress}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: imageData.uri }}
              style={styles.circularImage}
            />

            {/* Edit badge */}
            <View style={styles.editBadge}>
              <FontAwesome5 name='pencil-alt' size={14} color='#fff' />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.imagePlaceholder}
            onPress={handleImagePress}
            activeOpacity={0.7}
          >
            <FontAwesome5 name='user-alt' size={40} color={Colors.primary} />
            <Text style={styles.placeholderText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  loadingContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'visible',
  },
  circularImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 8,
    color: Colors.primary,
    fontWeight: '500',
  },
});
