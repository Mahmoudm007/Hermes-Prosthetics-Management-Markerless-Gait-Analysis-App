import { View, StyleSheet } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

import { Colors } from '@/constants/Colors';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  labelOn?: string;
  labelOff?: string;
  disabled?: boolean;
}

export default function ToggleSwitch({
  value,
  onValueChange,
  labelOn = 'Yes',
  labelOff = 'No',
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <View style={styles.container}>
      <BouncyCheckbox
        isChecked={value === true}
        onPress={(isChecked) => onValueChange(isChecked)}
        fillColor={Colors.primary}
        iconStyle={{ borderColor: Colors.primary }}
        textStyle={{
          textDecorationLine: 'none',
          marginLeft: -4,
        }}
        text={value === true ? labelOn : labelOff}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
