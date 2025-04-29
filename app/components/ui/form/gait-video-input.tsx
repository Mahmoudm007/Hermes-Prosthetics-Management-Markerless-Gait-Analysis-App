import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Dimensions,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { FontAwesome5 } from '@expo/vector-icons';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system';

import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * 1.5;

interface GaitVideoInputProps {
  initialVideoUrl: string | null;
  onVideoChange: (videoData: VideoData | null) => void;
  maxDuration?: number; // in seconds
  disabled?: boolean;
}

export interface VideoData {
  uri: string;
  base64?: string | null;
  fileName?: string;
  type?: string;
  duration?: number;
  thumbnailUri?: string;
  isChanged: boolean;
  size?: number;
}

export default function GaitVideoInput({
  initialVideoUrl,
  onVideoChange,
  maxDuration = 10,
  disabled = false,
}: GaitVideoInputProps) {
  const [videoData, setVideoData] = useState<VideoData | null>(
    initialVideoUrl
      ? {
          uri: initialVideoUrl,
          isChanged: false,
        }
      : null
  );
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [videoSize, setVideoSize] = useState<string | null>(null);

  const videoRef = useRef<Video>(null);
  const previewVideoRef = useRef<Video>(null);
  const { showActionSheetWithOptions } = useActionSheet();

  const handleVideoPress = () => {
    if (videoData) {
      // If we already have a video, show edit/remove/play options
      showEditRemoveOptions();
    } else {
      // If no video, show options to add one
      showAddVideoOptions();
    }
  };

  const showAddVideoOptions = () => {
    const options = ['Record Video', 'Choose from Gallery', 'Cancel'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        title: 'Add Gait Video',
        message: `Video should be ${maxDuration} seconds or less`,
        options,
        cancelButtonIndex,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            await handleRecordVideo();
            break;
          case 1:
            await handleChooseFromGallery();
            break;
        }
      }
    );
  };

  const showEditRemoveOptions = () => {
    const options = [
      'Preview Video',
      'Replace Video',
      'Remove Video',
      'Cancel',
    ];
    const destructiveButtonIndex = 2;
    const cancelButtonIndex = 3;

    showActionSheetWithOptions(
      {
        title: 'Manage Gait Video',
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case 0: // Preview Video
            setShowPreview(true);
            break;
          case 1: // Replace Video
            showAddVideoOptions();
            break;
          case 2: // Remove Video
            handleRemoveVideo();
            break;
        }
      }
    );
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRecordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      showCameraPermissionAlert();
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: maxDuration,
        quality: 0.5, // Lower quality for smaller file size
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        await processVideo(asset.uri, asset.base64);
      }
    } catch (error) {
      console.error('Error recording video:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      showGalleryPermissionAlert();
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        await processVideo(asset.uri, asset.base64);
      }
    } catch (error) {
      console.error('Error selecting video:', error);
    } finally {
      setLoading(false);
    }
  };

  const processVideo = async (uri: string, base64?: string | null) => {
    try {
      // Generate thumbnail
      const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
        uri,
        {
          time: 0,
          quality: 0.6,
        }
      );

      setThumbnailUri(thumbnailUri);

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const fileSize = fileInfo.exists ? fileInfo.size : 0;

      // Format size for display
      const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);
      setVideoSize(`${sizeInMB} MB`);

      // If base64 wasn't provided, try to get it
      let videoBase64 = base64;
      if (!videoBase64) {
        try {
          videoBase64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (error) {
          console.error('Error reading video as base64:', error);
        }
      }

      // Ensure base64 has the correct prefix
      const formattedBase64 = videoBase64
        ? `data:video/mp4;base64,${videoBase64}`
        : null;

      // We don't have Video.getStatusAsync, so we'll estimate duration
      const estimatedDuration = maxDuration; // Default to max duration

      const newVideoData: VideoData = {
        uri: uri,
        base64: formattedBase64,
        fileName: `gait_video_${Date.now()}.mp4`,
        type: 'video/mp4',
        duration: estimatedDuration,
        thumbnailUri: thumbnailUri,
        isChanged: true,
        size: fileSize,
      };
      setVideoData(newVideoData);
      onVideoChange(newVideoData);
    } catch (error) {
      console.error('Error processing video:', error);
    }
  };

  const showCameraPermissionAlert = () => {
    const options = ['Open Settings', 'Cancel'];
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        title: 'Camera Permission Required',
        message: 'Please grant camera permission to record a video',
        options,
        cancelButtonIndex,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
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
        message: 'Please grant photo library access to select videos',
        options,
        cancelButtonIndex,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        }
      }
    );
  };

  const handleRemoveVideo = () => {
    setVideoData(null);
    setThumbnailUri(null);
    setIsPlaying(false);
    setVideoSize(null);
    onVideoChange(null);
  };

  const handleVideoStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
      }

      if (status.positionMillis !== undefined) {
        setCurrentPosition(status.positionMillis / 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.videoPlaceholder}>
          <ActivityIndicator size='large' color={Colors.primary} />
          <Text style={styles.loadingText}>Processing video...</Text>
        </View>
      ) : videoData ? (
        <View style={styles.videoCard}>
          <View style={styles.videoWrapper}>
            {thumbnailUri ? (
              <TouchableOpacity
                style={styles.thumbnailContainer}
                onPress={togglePlayback}
                disabled={disabled}
                activeOpacity={0.8}
              >
                <View style={styles.thumbnail}>
                  {/* Use the thumbnail as background */}
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        backgroundColor: '#000',
                        borderRadius: 8,
                      },
                    ]}
                  >
                    <Video
                      ref={videoRef}
                      source={{ uri: videoData.uri }}
                      style={[styles.video, { opacity: isPlaying ? 1 : 0 }]}
                      resizeMode={ResizeMode.COVER}
                      useNativeControls={false}
                      isLooping
                      shouldPlay={isPlaying}
                      onPlaybackStatusUpdate={handleVideoStatusUpdate}
                    />
                    {!isPlaying && (
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          {
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            borderRadius: 8,
                          },
                        ]}
                      >
                        <View style={styles.playButtonContainer}>
                          <FontAwesome5 name='play' size={30} color='#fff' />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <Video
                ref={videoRef}
                source={{ uri: videoData.uri }}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                useNativeControls={false}
                isLooping
                onPlaybackStatusUpdate={handleVideoStatusUpdate}
              />
            )}

            <TouchableOpacity
              style={styles.editButton}
              onPress={handleVideoPress}
              activeOpacity={0.8}
            >
              <FontAwesome5 name='ellipsis-h' size={20} color='#fff' />
            </TouchableOpacity>

            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>
                {videoSize ? videoSize : `Max ${maxDuration}s`}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.videoPlaceholder}
          onPress={handleVideoPress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <FontAwesome5 name='video' size={40} color={Colors.primary} />
          <Text style={styles.placeholderText}>Add Gait Video</Text>
          <Text style={styles.placeholderSubtext}>
            Max {maxDuration} seconds
          </Text>
        </TouchableOpacity>
      )}

      {/* Video Preview Modal */}
      {showPreview && videoData && (
        <Modal visible={showPreview} animationType='slide'>
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Video Preview</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowPreview(false);
                  if (previewVideoRef.current) {
                    previewVideoRef.current.pauseAsync();
                  }
                }}
              >
                <FontAwesome5 name='times' size={20} color='#fff' />
              </TouchableOpacity>
            </View>

            <Video
              ref={previewVideoRef}
              source={{ uri: videoData.uri }}
              style={styles.previewVideo}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls={true}
              isLooping={true}
              shouldPlay={true}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) {
                  if (status.positionMillis !== undefined) {
                    setCurrentPosition(status.positionMillis / 1000);
                  }
                }
              }}
            />

            <View style={styles.previewControls}>
              <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
              <View style={styles.spacer} />
              <Text style={styles.timeText}>{formatTime(maxDuration)}</Text>
            </View>

            <Text style={styles.previewNote}>
              Maximum video duration: {maxDuration} seconds
            </Text>

            {videoSize && (
              <Text style={styles.previewNote}>Video size: {videoSize}</Text>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  videoCard: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: VIDEO_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    borderRadius: 8,
    width: '100%',
    height: VIDEO_HEIGHT,
  },
  playButtonContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    zIndex: 10,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  videoPlaceholder: {
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    width: '100%',
    height: VIDEO_HEIGHT,
  },
  placeholderText: {
    marginTop: 8,
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 16,
  },
  placeholderSubtext: {
    marginTop: 4,
    color: '#666',
    fontSize: 12,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.primary,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    padding: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewVideo: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  previewControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  spacer: {
    flex: 1,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
  },
  previewNote: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
