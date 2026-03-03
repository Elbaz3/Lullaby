import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Radius, FontWeight, FontSize } from '../constants/theme';
import { Baby } from '../types';

interface BabyAvatarProps {
  baby?: Baby;
  size?: number;
  showName?: boolean;
  showAge?: boolean;
}

const getAge = (dateOfBirth: string): string => {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const diffMs = now.getTime() - dob.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return `${diffDays}d`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years}y ${remMonths}mo` : `${years}y`;
};

export const BabyAvatar: React.FC<BabyAvatarProps> = ({
  baby,
  size = 56,
  showName = false,
  showAge = false,
}) => {
  if (!baby) {
    return (
      <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.4 }}>👶</Text>
      </View>
    );
  }

  const genderColor = baby.gender === 'boy' ? Colors.primarySoft : '#FCE4EC';
  const genderEmoji = baby.gender === 'boy' ? '👦' : '👧';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: genderColor,
          },
        ]}
      >
        {baby.avatar ? (
          <Image
            source={{ uri: baby.avatar }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        ) : (
          <Text style={{ fontSize: size * 0.45 }}>{genderEmoji}</Text>
        )}
      </View>
      {showName && <Text style={styles.name}>{baby.name}</Text>}
      {showAge && baby.dateOfBirth && (
        <Text style={styles.age}>{getAge(baby.dateOfBirth)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textDark,
  },
  age: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});