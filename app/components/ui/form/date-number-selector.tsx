import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';

interface DateNumberSelectorProps {
  date: Date | null;
  number: number | null;
  onDateChange: (date: Date | null) => void;
  onNumberChange: (number: number | null) => void;
  label?: string;
  hint?: string;
  error?: string;
  dateButtonLabel?: string;
  numberButtonLabel?: string;
  minNumber?: number;
  maxNumber?: number;
  numberIcon?: string;
}

export default function DateNumberSelector({
  date: initialDate,
  number: initialNumber,
  onDateChange,
  onNumberChange,
  label = 'Select Date or Number',
  hint = 'Choose either a specific date or a number',
  error,
  dateButtonLabel = 'Select Date',
  numberButtonLabel = 'Select Number',
  minNumber = 1,
  maxNumber = 100,
  numberIcon = 'calendar-alt',
}: DateNumberSelectorProps) {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isNumberPickerVisible, setNumberPickerVisible] = useState(false);

  const numbers = Array.from(
    { length: maxNumber - minNumber + 1 },
    (_, i) => minNumber + i
  );

  useEffect(() => {
    if (initialDate && initialNumber) {
      onNumberChange(null);
    }
  }, [initialDate, initialNumber, onNumberChange]);

  const handleDateConfirm = (selectedDate: Date) => {
    onDateChange(selectedDate);
    onNumberChange(null);
    setDatePickerVisible(false);
  };

  const handleNumberSelect = (selectedNumber: number) => {
    onNumberChange(selectedNumber);
    onDateChange(null);
    setNumberPickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.hint}>{hint}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, initialDate ? styles.activeButton : null]}
          onPress={() => setDatePickerVisible(true)}
        >
          <FontAwesome5
            name='calendar-alt'
            size={16}
            color={initialDate ? Colors.background : Colors.primary}
          />
          <Text
            style={[
              styles.buttonText,
              initialDate ? styles.activeButtonText : null,
            ]}
          >
            {initialDate ? format(initialDate, 'dd MMM yyyy') : dateButtonLabel}
          </Text>
          {initialDate && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => onDateChange(null)}
            >
              <Ionicons
                name='close-circle'
                size={16}
                color={Colors.background}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <TouchableOpacity
          style={[
            styles.button,
            initialNumber && !initialDate ? styles.activeButton : null,
          ]}
          onPress={() => setNumberPickerVisible(true)}
        >
          <FontAwesome5
            name={numberIcon}
            size={16}
            color={
              initialNumber && !initialDate ? Colors.background : Colors.primary
            }
          />
          <Text
            style={[
              styles.buttonText,
              initialNumber && !initialDate ? styles.activeButtonText : null,
            ]}
          >
            {initialNumber ? initialNumber.toString() : numberButtonLabel}
          </Text>
          {initialNumber && !initialDate && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => onNumberChange(null)}
            >
              <Ionicons
                name='close-circle'
                size={16}
                color={Colors.background}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode='date'
        date={initialDate || new Date()}
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
        maximumDate={new Date()}
      />

      <Modal
        visible={isNumberPickerVisible}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setNumberPickerVisible(false)}
      >
        <View style={styles.numberPickerOverlay}>
          <View style={styles.numberPickerContainer}>
            <View style={styles.numberPickerHeader}>
              <Text style={styles.numberPickerTitle}>Select Number</Text>
              <TouchableOpacity onPress={() => setNumberPickerVisible(false)}>
                <Ionicons name='close' size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={numbers}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.numberItem,
                    initialNumber === item && !initialDate
                      ? styles.selectedNumberItem
                      : null,
                  ]}
                  onPress={() => handleNumberSelect(item)}
                >
                  <Text
                    style={[
                      styles.numberItemText,
                      initialNumber === item && !initialDate
                        ? styles.selectedNumberItemText
                        : null,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              initialScrollIndex={numbers.findIndex(
                (n) => n === (initialNumber || minNumber)
              )}
              getItemLayout={(_, index) => ({
                length: 50,
                offset: 50 * index,
                index,
              })}
              contentContainerStyle={styles.numberList}
            />
          </View>
        </View>
      </Modal>
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
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    flex: 1,
  },
  activeButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    marginLeft: 8,
    color: Colors.primary,
    fontSize: 14,
  },
  activeButtonText: {
    color: Colors.background,
  },
  orText: {
    marginHorizontal: 12,
    color: '#666',
    fontWeight: '600',
  },
  clearButton: {
    marginLeft: 'auto',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  numberPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberPickerContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    padding: 16,
  },
  numberPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  numberPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  numberList: {
    paddingVertical: 8,
  },
  numberItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedNumberItem: {
    backgroundColor: Colors.primary,
  },
  numberItemText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
  selectedNumberItemText: {
    color: Colors.background,
    fontWeight: '600',
  },
});
