'use client';

import { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { FontAwesome5 } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

import { Colors } from '@/constants/Colors';

interface DetailedAnalysisSheetProps {
  analysis: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function DetailedAnalysisSheet({
  analysis,
  isVisible,
  onClose,
}: DetailedAnalysisSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

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
        onPress={() => bottomSheetRef.current?.close()}
      />
    ),
    []
  );

  const formattedAnalysis = analysis.replace(/\\n/g, '\n');

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        style={styles.sheetContainer}
      >
        <View style={styles.header}>
          <FontAwesome5 name='brain' size={28} color={Colors.primary} />
          <Text style={styles.title}>Detailed AI Analysis</Text>
        </View>

        <View>
          <Markdown>{formattedAnalysis}</Markdown>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: 'white',
  },
  indicator: {
    backgroundColor: Colors.tertiary,
    width: 50,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#2c3e50',
    flex: 1,
  },
  sheetContainer: {
    marginBottom: 20,
  },
});
