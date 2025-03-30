import { Text, TouchableOpacity, View } from 'react-native';
import {
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { FontAwesome5 } from '@expo/vector-icons';

import { patientProfileStyles } from '@/constants/patient-profile-styles';

interface DetailsSheetFooterProps extends BottomSheetFooterProps {
  handleUpdate: () => void;
  handleDelete: () => void;
  isPending?: boolean;
}

export default function DetailsSheetFooter({
  handleUpdate,
  handleDelete,
  isPending = false,
  ...props
}: DetailsSheetFooterProps) {
  return (
    <BottomSheetFooter {...props}>
      <View style={patientProfileStyles.sheetActionButtonsContainer}>
        <TouchableOpacity
          style={[
            patientProfileStyles.sheetActionButton,
            patientProfileStyles.sheetUpdateButton,
            isPending && patientProfileStyles.sheetDisabledActionButton,
          ]}
          onPress={handleUpdate}
          disabled={isPending}
        >
          <FontAwesome5 name='edit' size={20} color='white' />
          <Text style={patientProfileStyles.sheetActionButtonText}>Update</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            patientProfileStyles.sheetActionButton,
            patientProfileStyles.sheetDeleteButton,
            isPending && patientProfileStyles.sheetDisabledActionButton,
          ]}
          onPress={handleDelete}
          disabled={isPending}
        >
          <FontAwesome5 name='trash-alt' size={20} color='white' />
          <Text style={patientProfileStyles.sheetActionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetFooter>
  );
}
