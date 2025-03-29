import { Text, View } from 'react-native';

import { patientProfileStyles } from '@/constants/patient-profile-styles';

interface SectionHeaderProps {
  title: string;
  icon: JSX.Element;
}

export default function SectionHeader({ title, icon }: SectionHeaderProps) {
  return (
    <View style={patientProfileStyles.sectionHeader}>
      {icon}
      <Text style={patientProfileStyles.sectionTitle}>{title}</Text>
    </View>
  );
}
