import {
  TextInput,
  StyleSheet,
  type TextInputProps,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  hasError?: boolean;
  showClearButton?: boolean;
}

export default function FormInput({
  hasError,
  style,
  value,
  onChangeText,
  showClearButton = true,
  ...props
}: FormInputProps) {
  const handleClear = () => {
    if (onChangeText) {
      onChangeText('');
    }
  };

  const hasValue = value !== undefined && value !== null && value !== '';

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, hasError ? styles.inputError : null, style]}
        placeholderTextColor='#999'
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
      {showClearButton && hasValue && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Ionicons name='close-circle' size={30} color='#999' />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    width: '100%',
  },
  inputError: {
    borderColor: 'red',
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -15 }],
    zIndex: 1,
  },
});
