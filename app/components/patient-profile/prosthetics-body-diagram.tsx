'use client';

import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

import Body, {
  type ExtendedBodyPart,
  type Slug,
} from 'react-native-body-highlighter';

import BodyDiagramViewToggle from './body-diagram-view-toggle';
import { type Prosthetic, ProstheticType, Sex, Side } from '@/types';
import { useProstheticStore } from '@/hooks/use-prosthetic-store';

interface ProstheticsBodyDiagramProps {
  prosthetics: Prosthetic[];
  sex?: Sex;
  onProstheticSelect?: (prosthetic: Prosthetic | undefined) => void;
}

const PROSTHETIC_TO_BODY_PART: Partial<Record<ProstheticType, Slug>> = {
  [ProstheticType.Transtibial]: 'tibialis',
  [ProstheticType.Transfemoral]: 'quadriceps',
  [ProstheticType.PartialFoot]: 'feet',
  [ProstheticType.Syme]: 'ankles',
  [ProstheticType.KneeDisarticulation]: 'knees',
  [ProstheticType.HipDisarticulation]: 'gluteal',
  [ProstheticType.Transhumeral]: 'triceps',
  [ProstheticType.Transradial]: 'forearm',
  [ProstheticType.Hand]: 'hands',
  [ProstheticType.ShoulderDisarticulation]: 'deltoids',
};

const BODY_PART_TO_PROSTHETIC = Object.entries(PROSTHETIC_TO_BODY_PART).reduce(
  (acc, [key, value]) => {
    acc[value] = key as unknown as ProstheticType;
    return acc;
  },
  {} as Record<Slug, ProstheticType>
);

export default function ProstheticsBodyDiagram({
  prosthetics,
  sex = Sex.Female,
  onProstheticSelect,
}: ProstheticsBodyDiagramProps) {
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const { showProstheticDetails } = useProstheticStore();

  const mapSide = (side: Side): 'left' | 'right' | undefined => {
    switch (side) {
      case Side.Left:
        return 'left';
      case Side.Right:
        return 'right';
      case Side.Bilateral:
      case Side.Unknown:
        return undefined;
    }
  };

  const bodyPartsData = useMemo(() => {
    return prosthetics
      .map((prosthetic): ExtendedBodyPart | undefined => {
        const slug = PROSTHETIC_TO_BODY_PART[prosthetic.type];
        if (!slug) return undefined;

        return {
          slug,
          side: mapSide(prosthetic.side),
        };
      })
      .filter((item): item is ExtendedBodyPart => item !== undefined);
  }, [prosthetics]);

  const handleBodyPartPress = (part: ExtendedBodyPart, bodySide?: string) => {
    if (!part.slug) return;

    const prostheticType = BODY_PART_TO_PROSTHETIC[part.slug];
    if (!prostheticType) return;

    const prosthetic = prosthetics.find((p) => {
      if (bodySide) {
        const clickedSide = bodySide === 'left' ? Side.Left : Side.Right;
        return (
          p.type === prostheticType &&
          (p.side === clickedSide || p.side === Side.Bilateral)
        );
      } else {
        return p.type === prostheticType && p.side === Side.Bilateral;
      }
    });

    if (prosthetic) {
      onProstheticSelect?.(prosthetic);
      showProstheticDetails(prosthetic);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <BodyDiagramViewToggle
          value={viewSide}
          onChange={setViewSide}
          primaryColor={Colors.primary}
        />
      </View>

      <Body
        colors={[Colors.primary, Colors.primary]}
        data={bodyPartsData}
        onBodyPartPress={handleBodyPartPress}
        gender={sex === Sex.Male ? 'male' : 'female'}
        side={viewSide}
        scale={1.7}
        border='#dfdfdf'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
    padding: 16,
    borderRadius: 8,
  },
  toggleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
});
