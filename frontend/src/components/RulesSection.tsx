import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface RulesSectionProps {
  rules: string[];
  initiallyExpanded?: boolean;
}

const MAX_COLLAPSED = 3;

const RulesSection: React.FC<RulesSectionProps> = ({
  rules,
  initiallyExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  if (!rules.length) return null;

  const hasMore = rules.length > MAX_COLLAPSED;
  const displayed = expanded ? rules : rules.slice(0, MAX_COLLAPSED);

  const toggle = (): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading} accessibilityRole="header">
        📋  Rules & Requirements
      </Text>
      {displayed.map((rule, i) => (
        <View key={i} style={styles.ruleRow} accessibilityLabel={`Rule ${i + 1}: ${rule}`}>
          <View style={styles.bullet}>
            <Text style={styles.bulletText}>{i + 1}</Text>
          </View>
          <Text style={styles.ruleText}>{rule}</Text>
        </View>
      ))}
      {hasMore && (
        <TouchableOpacity
          onPress={toggle}
          style={styles.toggleBtn}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show fewer rules' : `Show all ${rules.length} rules`}
        >
          <Text style={styles.toggleText}>
            {expanded
              ? '▲  Show less'
              : `▼  Show all ${rules.length} rules`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  heading: {
    fontSize: FONT_SIZE.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  bullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  ruleText: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  toggleBtn: {
    marginTop: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  toggleText: {
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default RulesSection;
