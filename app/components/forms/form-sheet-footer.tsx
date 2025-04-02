import { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';

interface FormSheetFooterProps {
  onClose: () => void;
  onReset: () => void;
  handleSave: () => void;
  isPending: boolean;
  isEditMode: boolean;
}

export default function FormSheetFooter({
  onClose,
  onReset,
  handleSave,
  isPending,
  isEditMode,
}: FormSheetFooterProps) {
  const cancelOpacity = useSharedValue(1);
  const cancelWidth = useSharedValue(0.48);
  const saveWidth = useSharedValue(0.48);

  useEffect(() => {
    if (isPending) {
      cancelOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.ease,
      });
      cancelWidth.value = withTiming(0, { duration: 200, easing: Easing.ease });
      saveWidth.value = withTiming(1, { duration: 200, easing: Easing.ease });
    } else {
      cancelOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.ease,
      });
      cancelWidth.value = withTiming(0.48, {
        duration: 200,
        easing: Easing.ease,
      });
      saveWidth.value = withTiming(0.48, {
        duration: 200,
        easing: Easing.ease,
      });
    }
  }, [isPending, cancelOpacity, cancelWidth, saveWidth]);

  const cancelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cancelOpacity.value,
    width: `${cancelWidth.value * 100}%`,
  }));

  const saveAnimatedStyle = useAnimatedStyle(() => ({
    width: `${saveWidth.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.buttonContainer, cancelAnimatedStyle]}>
        <TouchableOpacity
          style={[styles.button, styles.closeButton]}
          onPress={isEditMode ? onReset : onClose}
          disabled={isPending}
        >
          {isEditMode ? (
            <>
              <MaterialCommunityIcons name='restart' size={20} color='black' />
              <Text style={[styles.buttonText, styles.closeButtonText]}>
                Reset
              </Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name='close' size={20} color='black' />
              <Text style={[styles.buttonText, styles.closeButtonText]}>
                Close
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.buttonContainer, saveAnimatedStyle]}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <>
              <FontAwesome5 name='save' size={20} color='white' />
              <Text style={styles.buttonText}>
                {isEditMode ? 'Update' : 'Save'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 80,
  },
  buttonContainer: {
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.lightBorder,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  closeButtonText: {
    color: 'black',
  },
});
