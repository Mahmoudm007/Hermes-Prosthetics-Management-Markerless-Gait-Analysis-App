import { type ImageSourcePropType, Platform } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import {
  createNativeBottomTabNavigator,
  NativeBottomTabNavigationOptions,
  NativeBottomTabNavigationEventMap,
} from '@bottom-tabs/react-navigation';

import type { SFSymbol } from 'sf-symbols-typescript';
import type { AppleIcon } from 'react-native-bottom-tabs';

const BottomTabNavigator = createNativeBottomTabNavigator().Navigator;

export const Tabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof BottomTabNavigator,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>(BottomTabNavigator);

const isAndroid = Platform.OS === 'android';

export function tabBarIcon({
  focused,
  sfSymbol,
  focusedSfSymbol,
  icon,
  focusedIcon,
}: {
  focused: boolean;
  sfSymbol: SFSymbol;
  focusedSfSymbol?: SFSymbol;
  icon: { uri: string; scale: number };
  focusedIcon?: { uri: string; scale: number };
}): ImageSourcePropType | AppleIcon {
  if (isAndroid) {
    return focused ? focusedIcon ?? icon : icon;
  }

  return {
    sfSymbol: focused ? focusedSfSymbol ?? sfSymbol : sfSymbol,
  };
}
