import Icon from '@react-native-vector-icons/material-design-icons';

import { Colors } from '@/constants/Colors';
import { tabBarIcon, Tabs } from '@/components/tabs';

const homeOutlineIcon = Icon.getImageSourceSync('home-outline', 24);
const homeIcon = Icon.getImageSourceSync('home', 24);
const accountMultipleOutlineIcon = Icon.getImageSourceSync(
  'account-multiple-outline',
  24
);
const accountMultipleIcon = Icon.getImageSourceSync('account-multiple', 24);
const fileVideoOutlineIcon = Icon.getImageSourceSync('file-video-outline', 24);
const fileVideoIcon = Icon.getImageSourceSync('file-video', 24);
const magnifyIcon = Icon.getImageSourceSync('magnify', 24);
const viewGridOutlineIcon = Icon.getImageSourceSync('view-grid-outline', 24);
const viewGridIcon = Icon.getImageSourceSync('view-grid', 24);

export default function TabsLayout() {
  return (
    <Tabs
      ignoresTopSafeArea
      hapticFeedbackEnabled
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
      }}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) =>
            tabBarIcon({
              focused,
              sfSymbol: 'house',
              focusedSfSymbol: 'house.fill',
              icon: homeOutlineIcon!,
              focusedIcon: homeIcon!,
            }),
        }}
      />
      <Tabs.Screen
        name='patients'
        options={{
          title: 'Patients',
          tabBarIcon: ({ focused }) =>
            tabBarIcon({
              focused,
              sfSymbol: 'person.2',
              focusedSfSymbol: 'person.2.fill',
              icon: accountMultipleOutlineIcon!,
              focusedIcon: accountMultipleIcon!,
            }),
        }}
      />
      <Tabs.Screen
        name='sessions'
        options={{
          title: 'Sessions',
          tabBarIcon: ({ focused }) =>
            tabBarIcon({
              focused,
              sfSymbol: 'video',
              focusedSfSymbol: 'video.fill',
              icon: fileVideoOutlineIcon!,
              focusedIcon: fileVideoIcon!,
            }),
        }}
      />
      <Tabs.Screen
        name='search'
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) =>
            tabBarIcon({
              focused,
              sfSymbol: 'magnifyingglass.circle',
              focusedSfSymbol: 'magnifyingglass.circle.fill',
              icon: magnifyIcon!,
            }),
        }}
      />
      <Tabs.Screen
        name='browse'
        options={{
          title: 'Browse',
          tabBarIcon: ({ focused }) =>
            tabBarIcon({
              focused,
              sfSymbol: 'square.grid.2x2',
              focusedSfSymbol: 'square.grid.2x2.fill',
              icon: viewGridOutlineIcon!,
              focusedIcon: viewGridIcon!,
            }),
        }}
      />
    </Tabs>
  );
}
