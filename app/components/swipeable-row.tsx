import { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';

export interface SwipeAction {
  text: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  platform?: 'ios' | 'android' | 'web';
}

interface SwipeableRowProps {
  children: React.ReactNode;
  actions?: SwipeAction[];
  rightThreshold?: number;
  friction?: number;
}

export function SwipeableRow({
  children,
  actions = [],
  rightThreshold = 40,
  friction = 2,
}: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable | null>(null);

  const renderRightAction = (
    action: SwipeAction,
    x: number,
    progress: Animated.AnimatedInterpolation<number>,
    index: number
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });

    const pressHandler = () => {
      swipeableRef.current?.close();
      action.onPress();
    };

    return (
      <Animated.View
        key={`action-${index}`}
        style={{ flex: 1, transform: [{ translateX: trans }] }}
      >
        <Pressable
          style={[styles.actionContainer, { backgroundColor: action.color }]}
          onPress={pressHandler}
        >
          <Ionicons
            name={action.icon}
            size={24}
            color={Colors.background}
            style={{ paddingTop: 10 }}
          />
          <Text style={styles.actionText}>{action.text}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragAnimatedValue: Animated.AnimatedInterpolation<number>
  ) => {
    const filteredActions = actions.filter(
      (action) => !action.platform || action.platform === Platform.OS
    );

    if (filteredActions.length === 0) return null;

    const width = filteredActions.length * 96;

    return (
      <View
        style={{
          width: width,
          flexDirection: 'row',
        }}
      >
        {filteredActions.map((action, index) => {
          const x = (filteredActions.length - index) * 96;
          return renderRightAction(action, x, progress, index);
        })}
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={friction}
      enableTrackpadTwoFingerGesture
      rightThreshold={rightThreshold}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 96,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 10,
  },
});
