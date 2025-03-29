import { Text, View } from 'react-native';
import { patientProfileStyles } from '@/constants/patient-profile-styles';

interface InfoItemProps {
  icon: JSX.Element;
  label: string;
  value: string | number;
}

export default function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <View style={patientProfileStyles.infoItem}>
      <View style={patientProfileStyles.infoIcon}>{icon}</View>
      <View style={patientProfileStyles.infoContent}>
        <Text style={patientProfileStyles.infoLabel}>{label}</Text>
        <Text style={patientProfileStyles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}
