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

interface DateYearSelectorProps {
  date: Date | null;
  year: number | null;
  onDateChange: (date: Date | null) => void;
  onYearChange: (year: number | null) => void;
  label?: string;
  hint?: string;
  error?: string;
}

export default function DateYearSelector({
  date: initialDate,
  year: initialYear,
  onDateChange,
  onYearChange,
  label = 'When did it happen?',
  hint = 'Select either a specific date or just the year',
  error,
}: DateYearSelectorProps) {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isYearPickerVisible, setYearPickerVisible] = useState(false);
  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 1899 },
    (_, i) => currentYear - i
  );

  useEffect(() => {
    if (initialDate && initialYear) {
      onYearChange(null);
    }
  }, [initialDate, initialYear, onYearChange]);

  const handleDateConfirm = (selectedDate: Date) => {
    onDateChange(selectedDate);
    onYearChange(null);
    setDatePickerVisible(false);
  };

  const handleYearSelect = (selectedYear: number) => {
    onYearChange(selectedYear);
    onDateChange(null);
    setYearPickerVisible(false);
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
            {initialDate ? format(initialDate, 'dd MMM yyyy') : 'Select Date'}
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
            initialYear && !initialDate ? styles.activeButton : null,
          ]}
          onPress={() => setYearPickerVisible(true)}
        >
          <FontAwesome5
            name='calendar-alt'
            size={16}
            color={
              initialYear && !initialDate ? Colors.background : Colors.primary
            }
          />
          <Text
            style={[
              styles.buttonText,
              initialYear && !initialDate ? styles.activeButtonText : null,
            ]}
          >
            {initialYear && !initialDate ? initialYear : 'Select Year'}
          </Text>
          {initialYear && !initialDate && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => onYearChange(null)}
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
        minimumDate={new Date(1900, 0, 1)}
      />

      <Modal
        visible={isYearPickerVisible}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setYearPickerVisible(false)}
      >
        <View style={styles.yearPickerOverlay}>
          <View style={styles.yearPickerContainer}>
            <View style={styles.yearPickerHeader}>
              <Text style={styles.yearPickerTitle}>Select Year</Text>
              <TouchableOpacity onPress={() => setYearPickerVisible(false)}>
                <Ionicons name='close' size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={years}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.yearItem,
                    initialYear === item && !initialDate
                      ? styles.selectedYearItem
                      : null,
                  ]}
                  onPress={() => handleYearSelect(item)}
                >
                  <Text
                    style={[
                      styles.yearItemText,
                      initialYear === item && !initialDate
                        ? styles.selectedYearItemText
                        : null,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              initialScrollIndex={years.findIndex(
                (y) => y === (initialYear || currentYear)
              )}
              getItemLayout={(_, index) => ({
                length: 50,
                offset: 50 * index,
                index,
              })}
              contentContainerStyle={styles.yearList}
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
  yearPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearPickerContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    padding: 16,
  },
  yearPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  yearPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  yearList: {
    paddingVertical: 8,
  },
  yearItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedYearItem: {
    backgroundColor: Colors.primary,
  },
  yearItemText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
  selectedYearItemText: {
    color: Colors.background,
    fontWeight: '600',
  },
});
