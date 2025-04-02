import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';

interface SelectOptionProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onClear?: () => void;
}

export default function SelectOption({
  label,
  selected,
  disabled = false,
  onSelect,
  onClear,
}: SelectOptionProps) {
  const handlePress = () => {
    if (selected && onClear) {
      onClear();
    } else {
      onSelect();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.selectOption,
        selected ? styles.selectedOption : null,
        disabled ? { opacity: selected ? 0.85 : 0.5 } : null,
      ]}
      activeOpacity={0.6}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.selectOptionText,
          selected ? styles.selectedOptionText : null,
        ]}
      >
        {label}
      </Text>
      {selected && onClear && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          <Ionicons name='close-circle' size={18} color={Colors.background} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  selectOption: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: Colors.primary,
  },
  selectOptionText: {
    color: Colors.primary,
    fontSize: 14,
  },
  selectedOptionText: {
    color: Colors.background,
  },
  clearButton: {
    marginLeft: 8,
  },
});
