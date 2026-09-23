import React, { ReactNode, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/theme';

export interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  containerStyle?: any;
}

export function FormInput({
  label,
  error,
  leftElement,
  rightElement,
  containerStyle,
  style,
  ...textInputProps
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (textInputProps.onFocus) {
      textInputProps.onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (textInputProps.onBlur) {
      textInputProps.onBlur(e);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        error ? styles.inputWrapperError : null
      ]}>
        {leftElement && (
          <View style={styles.leftContainer}>
            {leftElement}
          </View>
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Theme.colors.mutedFg}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
        
        {/* Render either the custom rightElement, or an info icon if there is an error, or nothing */}
        <View style={styles.rightContainer}>
          {rightElement ? (
            rightElement
          ) : error ? (
            <Ionicons name="information-circle-outline" size={20} color={Theme.colors.mutedFg} />
          ) : null}
        </View>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.mutedFg,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.bg,
    overflow: 'hidden', // Ensures inner items respect border radius
  },
  inputWrapperFocused: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: Theme.colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: Theme.colors.fg,
  },
  leftContainer: {
    paddingLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightContainer: {
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
});
