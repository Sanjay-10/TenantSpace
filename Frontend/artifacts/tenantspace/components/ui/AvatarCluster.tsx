import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

export interface AvatarClusterProps {
  tenants: any[];
  size?: number;
  fallbackInitials?: string;
  fallbackColor?: string;
}

export const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getColorIndex = (idStr: string) => {
  if (!idStr) return 0;
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const getTenantColor = (idStr: string) => {
  const colors = [
    '#FEE2E2', '#FFEDD5', '#FEF3C7', '#DCFCE7', '#D1FAE5', '#CCFBF1', '#CFFAFE', '#E0F2FE',
    '#DBEAFE', '#E0E7FF', '#EDE9FE', '#F3E8FF', '#FAE8FF', '#FCE7F3', '#FFE4E6', '#ECFCCB'
  ];
  return colors[getColorIndex(idStr) % colors.length];
};

export const getTenantTextColor = (idStr: string) => {
  const colors = [
    '#B91C1C', '#C2410C', '#B45309', '#15803D', '#047857', '#0F766E', '#0E7490', '#0369A1',
    '#1D4ED8', '#4338CA', '#6D28D9', '#7E22CE', '#A21CAF', '#BE185D', '#BE123C', '#4D7C0F'
  ];
  return colors[getColorIndex(idStr) % colors.length];
};

export function AvatarCluster({ tenants, size = 50, fallbackInitials = 'ALL', fallbackColor = '#3B82F6' }: AvatarClusterProps) {
  if (!tenants || tenants.length === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: fallbackColor, top: 0, left: 0 }]}>
          <Text style={[styles.text, { fontSize: size * 0.35, color: '#fff' }]}>{fallbackInitials}</Text>
        </View>
      </View>
    );
  }

  const renderAvatar = (t: any, s: number, pos: any, index: number, zIndex: number) => {
    return (
      <View 
        key={t.id || index} 
        style={[
          styles.avatar, 
          pos, 
          { 
            width: s, 
            height: s, 
            borderRadius: s / 2, 
            backgroundColor: getTenantColor(t.id || String(index)),
            zIndex
          }
        ]}
      >
        <Text style={[styles.text, { fontSize: s * 0.4, color: getTenantTextColor(t.id || String(index)) }]}>
          {getInitials(t.full_name)}
        </Text>
      </View>
    );
  };

  const len = tenants.length;

  if (len === 1) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        {renderAvatar(tenants[0], size, { top: 0, left: 0 }, 0, 1)}
      </View>
    );
  }

  if (len === 2) {
    const s = size * 0.7; // 70% of container
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        {renderAvatar(tenants[0], s, { top: 0, left: 0 }, 0, 1)}
        {renderAvatar(tenants[1], s, { bottom: 0, right: 0 }, 1, 2)}
      </View>
    );
  }

  if (len === 3) {
    const s = size * 0.6;
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        {renderAvatar(tenants[0], s, { top: 0, left: (size - s) / 2 }, 0, 3)}
        {renderAvatar(tenants[1], s, { bottom: 0, left: 0 }, 1, 2)}
        {renderAvatar(tenants[2], s, { bottom: 0, right: 0 }, 2, 1)}
      </View>
    );
  }

  // 4 or more
  const s = size * 0.55;
  const remaining = len - 3;
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {renderAvatar(tenants[0], s, { top: 0, left: 0 }, 0, 4)}
      {renderAvatar(tenants[1], s, { top: 0, right: 0 }, 1, 3)}
      {renderAvatar(tenants[2], s, { bottom: 0, left: 0 }, 2, 2)}
      <View style={[styles.avatar, { width: s, height: s, borderRadius: s / 2, backgroundColor: Theme.colors.success, bottom: 0, right: 0, zIndex: 1 }]}>
        <Text style={[styles.text, { fontSize: s * 0.4, color: '#fff' }]}>+{remaining}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  text: {
    fontWeight: '800',
  }
});
