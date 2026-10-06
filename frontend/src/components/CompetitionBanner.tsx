import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../utils/constants';

const { width, height } = Dimensions.get('window');
const BANNER_HEIGHT = height * 0.32;

interface CompetitionBannerProps {
  imageUrl?: string;
  onBack: () => void;
}

const CompetitionBanner: React.FC<CompetitionBannerProps> = ({
  imageUrl,
  onBack,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container} accessibilityRole="image" accessibilityLabel="Competition banner">
      <Image
        source={
          imageUrl
            ? { uri: imageUrl }
            : require('../../assets/icon.png')
        }
        style={styles.image}
        resizeMode="cover"
      />
      {/* Gradient overlay — fades image into background */}
      <LinearGradient
        colors={['transparent', 'rgba(13,13,26,0.6)', COLORS.bgDark]}
        style={StyleSheet.absoluteFill}
        locations={[0.3, 0.7, 1]}
      />
      {/* Back button */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + SPACING.sm }]}
        onPress={onBack}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: BANNER_HEIGHT,
    backgroundColor: COLORS.bgSurface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13,13,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
});

export default CompetitionBanner;
