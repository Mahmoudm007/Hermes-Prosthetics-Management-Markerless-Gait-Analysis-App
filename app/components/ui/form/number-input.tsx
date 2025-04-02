import { View, Text, type TextStyle } from 'react-native';
import { useCallback } from 'react';

import FormInput from './form-input';
import { formSheetStyles } from '@/constants/form-sheet-styles';

interface NumberInputProps {
  value: number | null | undefined;
  onChangeText: (value: string) => void;
  placeholder?: string;
  unit?: string;
  hasError?: boolean;
  style?: TextStyle;
}

export default function NumberInput({
  value,
  onChangeText,
  placeholder = 'Enter value',
  unit,
  hasError,
  style,
}: NumberInputProps) {
  return (
    <View style={formSheetStyles.numberInputContainer}>
      <View style={{ flex: 1, position: 'relative' }}>
        <FormInput
          style={[formSheetStyles.numberInput, style]}
          value={value ? `${value}` : ''}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType='numeric'
          hasError={hasError}
          showClearButton
        />
      </View>
      {unit && <Text style={formSheetStyles.unitLabel}>{unit}</Text>}
    </View>
  );
}
