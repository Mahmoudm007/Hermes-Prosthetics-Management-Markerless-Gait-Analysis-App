import React, { useMemo, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import Body, {
  type ExtendedBodyPart,
  type Slug,
} from 'react-native-body-highlighter';

import BodyDiagramViewToggle from './body-diagram-view-toggle';

import { useProstheticStore } from '@/hooks/use-prosthetic-store';
import { type Prosthetic, ProstheticType, Sex, Side } from '@/types';

interface ProstheticsBodyDiagramProps {
  prosthetics: Prosthetic[];
  sex?: Sex;
  onProstheticSelect?: (prosthetic: Prosthetic | undefined) => void;
}

const PROSTHETIC_TO_BODY_PART: Partial<Record<ProstheticType, Slug[]>> = {
  [ProstheticType.Transtibial]: ['tibialis', 'calves'],
  [ProstheticType.Transfemoral]: ['quadriceps', 'hamstring'],
  [ProstheticType.PartialFoot]: ['feet'],
  [ProstheticType.Syme]: ['ankles'],
  [ProstheticType.KneeDisarticulation]: ['knees'],
  [ProstheticType.HipDisarticulation]: ['gluteal'],
  [ProstheticType.Transhumeral]: ['biceps', 'triceps'],
  [ProstheticType.Transradial]: ['forearm'],
  [ProstheticType.Hand]: ['hands'],
  [ProstheticType.ShoulderDisarticulation]: ['deltoids'],
  [ProstheticType.Finger]: [],
  [ProstheticType.Toe]: [],
  [ProstheticType.Other]: [],
};

const BODY_PART_TO_PROSTHETIC = Object.entries(PROSTHETIC_TO_BODY_PART).reduce(
  (acc, [type, slugs]) => {
    slugs.forEach((slug) => {
      acc[slug] = type as ProstheticType;
    });
    return acc;
  },
  {} as Record<Slug, ProstheticType>
);

const SIDE_MAP: Record<Side, 'left' | 'right' | undefined> = {
  [Side.Left]: 'left',
  [Side.Right]: 'right',
  [Side.Bilateral]: undefined,
  [Side.Unknown]: undefined,
};

const MemoizedBody = React.memo(Body);

export default function ProstheticsBodyDiagram({
  prosthetics,
  sex = Sex.Female,
  onProstheticSelect,
}: ProstheticsBodyDiagramProps) {
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const { showProstheticDetails } = useProstheticStore();

  const mapSide = useCallback((side: Side): 'left' | 'right' | undefined => {
    return SIDE_MAP[side];
  }, []);

  const activeProsthetics = useMemo(
    () => prosthetics.filter((prosthetic) => prosthetic.isActive),
    [prosthetics]
  );

  const initialBodyPartsData = useMemo(() => {
    return activeProsthetics.flatMap((prosthetic): ExtendedBodyPart[] => {
      const slugs = PROSTHETIC_TO_BODY_PART[prosthetic.type] || [];
      if (!slugs.length) return [];
      const side = mapSide(prosthetic.side);
      return slugs.map((slug) => ({
        slug,
        side,
      }));
    });
  }, [activeProsthetics, mapSide]);

  const bodyPartsData = useMemo(() => {
    const slugMap = new Map<Slug, Set<'left' | 'right' | undefined>>();

    initialBodyPartsData.forEach(({ slug, side }) => {
      if (slug && !slugMap.has(slug)) {
        slugMap.set(slug, new Set());
      }
      if (slug) {
        slugMap.get(slug)?.add(side);
      }
    });

    return Array.from(slugMap.entries()).map(([slug, sides]) => {
      const hasLeftAndRight = sides.has('left') && sides.has('right');
      const hasUndefined = sides.has(undefined);

      if (hasLeftAndRight || hasUndefined || sides.size > 2) {
        return { slug, side: undefined };
      } else if (sides.size === 1) {
        const sideValue = Array.from(sides)[0];
        return { slug, side: sideValue };
      } else {
        return { slug, side: Array.from(sides)[0] };
      }
    });
  }, [initialBodyPartsData]);

  const handleBodyPartPress = useCallback(
    (part: ExtendedBodyPart, bodySide?: string) => {
      if (!part.slug) return;
      const prostheticType = BODY_PART_TO_PROSTHETIC[part.slug];
      if (!prostheticType) return;

      const prosthetic = activeProsthetics.find((p) => {
        const slugsForType = PROSTHETIC_TO_BODY_PART[p.type] || [];
        if (!part.slug || !slugsForType.includes(part.slug)) return false;

        if (bodySide) {
          const clickedSide = bodySide === 'left' ? Side.Left : Side.Right;
          return (
            p.type === prostheticType &&
            (p.side === clickedSide || p.side === Side.Bilateral)
          );
        }
        return p.type === prostheticType && p.side === Side.Bilateral;
      });

      if (prosthetic) {
        onProstheticSelect?.(prosthetic);
        showProstheticDetails(prosthetic);
      }
    },
    [activeProsthetics, onProstheticSelect, showProstheticDetails]
  );

  const gender = useMemo(() => (sex === Sex.Male ? 'male' : 'female'), [sex]);

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <BodyDiagramViewToggle
          value={viewSide}
          onChange={setViewSide}
          primaryColor={Colors.primary}
        />
      </View>

      <MemoizedBody
        colors={[Colors.primary, Colors.primary]}
        data={bodyPartsData}
        onBodyPartPress={handleBodyPartPress}
        gender={gender}
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
