import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

import Body, {
  type ExtendedBodyPart,
  type Slug,
} from 'react-native-body-highlighter';

import BodyDiagramViewToggle from './body-diagram-view-toggle';
import { type Prosthetic, ProstheticType, Sex, Side } from '@/types';

interface ProstheticsBodyDiagramProps {
  prosthetics: Prosthetic[];
  sex?: Sex;
  onProstheticSelect?: (prosthetic: Prosthetic | undefined) => void;
}

const BODY_PARTS_MAPPING: { [key in string]: ProstheticType } = {
  tibialis: ProstheticType.Transtibial,
  quadriceps: ProstheticType.Transfemoral,
  feet: ProstheticType.PartialFoot,
  ankles: ProstheticType.Syme,
  knees: ProstheticType.KneeDisarticulation,
  gluteal: ProstheticType.HipDisarticulation,
  triceps: ProstheticType.Transhumeral,
  forearm: ProstheticType.Transradial,
  hands: ProstheticType.Hand,
  deltoids: ProstheticType.ShoulderDisarticulation,
};

const PROSTHETIC_TO_BODY_PART = Object.entries(BODY_PARTS_MAPPING).reduce(
  (acc, [key, value]) => {
    acc[value] = key as Slug;
    return acc;
  },
  {} as Record<ProstheticType, Slug>
);

export default function ProstheticsBodyDiagram({
  prosthetics,
  sex,
  onProstheticSelect,
}: ProstheticsBodyDiagramProps) {
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

  const mapSide = (side: Side): 'left' | 'right' | undefined => {
    switch (side) {
      case Side.Left:
        return 'left';
      case Side.Right:
        return 'right';
      case Side.Bilateral:
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

    const prostheticType = BODY_PARTS_MAPPING[part.slug];
    const prosthetic = prosthetics.find((p) => {
      const isSameSideOrBilateral = bodySide
        ? p.side.toLowerCase() === bodySide
        : p.side === Side.Bilateral;
      return p.type === prostheticType && isSameSideOrBilateral;
    });

    onProstheticSelect?.(prosthetic);
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
