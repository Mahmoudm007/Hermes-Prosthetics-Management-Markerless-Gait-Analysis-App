import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'sf-symbols-typescript';

import { Colors } from '@/constants/Colors';

interface MenuItem {
  key: string;
  title: string;
  style?: React.CSSProperties;
  icon?: SFSymbol;
  onSelect?: () => void;
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

interface MoreButtonProps {
  menuConfig?: (MenuItem | MenuGroup)[];
  disabled?: boolean;
}

export function MoreButton({
  menuConfig,
  disabled = false,
}: MoreButtonProps = {}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger disabled={disabled}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.6}
          disabled={disabled}
        >
          <Ionicons
            name='ellipsis-horizontal-outline'
            size={30}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {menuConfig && menuConfig.length > 0 ? (
          menuConfig.map((entry, index) => {
            if ('key' in entry && !('items' in entry)) {
              const item = entry as MenuItem;
              return (
                <DropdownMenu.Item key={item.key} onSelect={item.onSelect}>
                  <DropdownMenu.ItemTitle style={item.style}>
                    {item.title}
                  </DropdownMenu.ItemTitle>
                  {item.icon && (
                    <DropdownMenu.ItemIcon
                      ios={{
                        name: item.icon,
                        pointSize: 24,
                      }}
                    />
                  )}
                </DropdownMenu.Item>
              );
            }

            if ('items' in entry) {
              const group = entry as MenuGroup;
              return (
                <DropdownMenu.Group key={`group-${index}`} title={group.title}>
                  {group.items.map((item) => (
                    <DropdownMenu.Item key={item.key} onSelect={item.onSelect}>
                      <DropdownMenu.ItemTitle style={item.style}>
                        {item.title}
                      </DropdownMenu.ItemTitle>
                      {item.icon && (
                        <DropdownMenu.ItemIcon
                          ios={{
                            name: item.icon,
                            pointSize: 24,
                          }}
                        />
                      )}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Group>
              );
            }

            return null;
          })
        ) : (
          <DropdownMenu.Label>No options available</DropdownMenu.Label>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 4,
  },
});
