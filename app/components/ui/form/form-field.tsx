import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Tooltip from 'react-native-walkthrough-tooltip';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  info?: string;
  children: React.ReactNode;
}

export default function FormField({
  label,
  required = false,
  error,
  info,
  children,
}: FormFieldProps) {
  const [showInfo, setShowInfo] = useState(false);
  const opacity = useSharedValue(0);

  const toggleInfo = () => {
    if (info) {
      setShowInfo(!showInfo);
      opacity.value = withTiming(showInfo ? 0 : 1, { duration: 300 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, error ? styles.errorLabel : null]}>
          {label}
          {required ? <Text style={styles.requiredStar}>*</Text> : null}
        </Text>
        {info && (
          <Tooltip
            isVisible={showInfo}
            content={<Text style={styles.tooltipText}>{info}</Text>}
            placement='top'
            onClose={() => setShowInfo(false)}
          >
            <TouchableOpacity onPress={toggleInfo} style={styles.infoIcon}>
              <Ionicons
                name='information-circle-outline'
                size={20}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </Tooltip>
        )}
      </View>
      {children}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {showInfo && !info && (
        <Animated.View style={[styles.infoContainer, animatedStyle]}>
          <Text style={styles.infoText}>{info}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  requiredStar: {
    color: 'red',
    marginLeft: 4,
  },
  errorLabel: {
    color: 'red',
  },
  infoIcon: {
    marginLeft: 8,
    padding: 2,
  },
  tooltipText: {
    fontSize: 14,
    color: '#333',
    padding: 4,
  },
  infoContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});
