import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

const FormInput = forwardRef<TextInput, FormInputProps>(
  ({ label, error, isPassword = false, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputRow, error ? styles.inputError : styles.inputNormal]}>
          <TextInput
            ref={ref}
            style={styles.input}
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry={isPassword && !visible}
            autoCapitalize={isPassword ? 'none' : rest.autoCapitalize}
            autoCorrect={false}
            {...rest}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setVisible((v) => !v)}
              style={styles.eyeBtn}
              accessibilityLabel={visible ? 'Hide password' : 'Show password'}
              accessibilityRole="button"
            >
              <Text style={styles.eyeText}>{visible ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }
);

FormInput.displayName = 'FormInput';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: COLORS.bgElevated,
  },
  inputNormal: {
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.bodyLg,
    color: COLORS.textPrimary,
  },
  eyeBtn: {
    paddingHorizontal: SPACING.md,
    height: 52,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 18,
  },
  errorText: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.caption,
    color: COLORS.error,
  },
});

export default FormInput;
