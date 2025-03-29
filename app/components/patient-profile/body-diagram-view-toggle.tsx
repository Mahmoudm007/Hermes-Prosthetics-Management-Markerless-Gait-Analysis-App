import { Colors } from '@/constants/Colors';
import { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface BodyDiagramViewToggle {
  value: 'front' | 'back';
  onChange: (value: 'front' | 'back') => void;
  primaryColor: string;
}

export default function BodyDiagramViewToggle({
  value,
  onChange,
  primaryColor,
}: BodyDiagramViewToggle) {
  const sliderPosition = useSharedValue(value === 'front' ? 0 : 1);

  useEffect(() => {
    sliderPosition.value = withSpring(value === 'front' ? 0 : 1, {
      damping: 15,
      stiffness: 120,
    });
  }, [value, sliderPosition]);

  const sliderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sliderPosition.value * 100 }],
    };
  });

  return (
    <View style={styles.toggleWrapper}>
      <Animated.View
        style={[
          styles.toggleSlider,
          sliderStyle,
          { backgroundColor: primaryColor },
        ]}
      />
      <View style={styles.toggleOptions}>
        <TouchableOpacity
          style={styles.toggleOption}
          onPress={() => onChange('front')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.toggleText, value === 'front' && styles.activeText]}
          >
            Front
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleOption}
          onPress={() => onChange('back')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.toggleText, value === 'back' && styles.activeText]}
          >
            Back
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleWrapper: {
    width: 200,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    position: 'relative',
    padding: 3,
  },
  toggleSlider: {
    position: 'absolute',
    width: 100,
    height: 30,
    borderRadius: 15,
    top: 3,
    left: 3,
  },
  toggleOptions: {
    flexDirection: 'row',
    height: '100%',
  },
  toggleOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
  },
  activeText: {
    color: Colors.background,
    fontWeight: '600',
  },
});
