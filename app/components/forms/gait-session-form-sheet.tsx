import { useCallback, useMemo, useRef } from 'react';
import { Keyboard } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

import GaitSessionForm, {
  type GaitSessionFormHandles,
} from './gait-session-form';
import FormSheetFooter from './form-sheet-footer';

import { formSheetStyles } from '@/constants/form-sheet-styles';

interface GaitSessionFormSheetProps {
  isVisible: boolean;
  onClose: () => void;
  patientId: number;
  onSuccess?: () => void;
}

export default function GaitSessionFormSheet({
  isVisible,
  onClose,
  patientId,
  onSuccess,
}: GaitSessionFormSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const formRef = useRef<GaitSessionFormHandles>(null);

  const snapPoints = useMemo(() => ['95%'], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.2}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        onPress={() => {
          Keyboard.dismiss();
          bottomSheetRef.current?.close();
        }}
      />
    ),
    []
  );

  const handleSave = async () => {
    if (formRef.current) {
      await formRef.current.handleSubmit();
    }
  };

  const handleReset = () => {
    if (formRef.current) {
      formRef.current.handleReset();
    }
  };

  const isPending = formRef.current?.isPending || false;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      keyboardBehavior='interactive'
      keyboardBlurBehavior='restore'
      android_keyboardInputMode='adjustResize'
      footerComponent={(props) => (
        <FormSheetFooter
          {...props}
          onClose={() => {
            bottomSheetRef.current?.close();
            onClose();
          }}
          onReset={handleReset}
          handleSave={handleSave}
          isPending={isPending}
          isEditMode={false}
        />
      )}
    >
      <BottomSheetScrollView
        contentContainerStyle={formSheetStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <GaitSessionForm
          ref={formRef}
          patientId={patientId}
          onClose={() => {
            bottomSheetRef.current?.close();
            onClose();
          }}
          displayMode='sheet'
          onSuccess={onSuccess}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
