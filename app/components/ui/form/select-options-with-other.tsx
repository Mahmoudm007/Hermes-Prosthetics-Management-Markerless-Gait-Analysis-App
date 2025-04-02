import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import FormInput from './form-input';
import SelectOption from './select-option';

import { formSheetStyles } from '@/constants/form-sheet-styles';

interface SelectOptionsWithOtherProps<T extends string | number> {
  options: Record<string, T>;
  labels: Record<T, string>;
  selectedValue: T | null | undefined;
  otherValue: string | null | undefined;
  onValueChange: (value: T | null) => void;
  onOtherValueChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  disableClear?: boolean;
}

export default function SelectOptionsWithOther<T extends string | number>({
  options,
  labels,
  selectedValue,
  otherValue,
  onValueChange,
  onOtherValueChange,
  placeholder = 'Enter other value',
  hasError = false,
  disabled = false,
  disableClear = false,
}: SelectOptionsWithOtherProps<T>) {
  const [showOtherInput, setShowOtherInput] = useState(false);

  useEffect(() => {
    if (selectedValue !== null && selectedValue !== undefined) {
      const valueStr = String(selectedValue);
      setShowOtherInput(valueStr.includes('Other'));
    } else {
      setShowOtherInput(false);
    }
  }, [selectedValue]);

  return (
    <View>
      <View style={formSheetStyles.selectContainer}>
        {Object.entries(options).map(([key, val]) => (
          <SelectOption
            key={key}
            label={labels[val as T]}
            selected={selectedValue === val}
            onSelect={() => (!disabled ? onValueChange(val as T) : null)}
            onClear={
              disableClear
                ? undefined
                : selectedValue === val && !disabled
                ? () => onValueChange(null)
                : undefined
            }
          />
        ))}
      </View>

      {showOtherInput && (
        <View style={styles.otherInputContainer}>
          <FormInput
            value={otherValue || ''}
            onChangeText={onOtherValueChange}
            placeholder={placeholder}
            hasError={hasError}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  otherInputContainer: {
    marginTop: 8,
  },
});
