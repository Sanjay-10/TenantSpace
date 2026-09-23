import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface PremiumAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  buttons?: AlertButton[];
  variant?: 'centered' | 'horizontal';
  onDismiss: () => void;
}

export default function PremiumAlert({
  visible,
  title,
  message,
  iconName,
  buttons = [{ text: 'OK', onPress: () => {} }],
  variant = 'centered',
  onDismiss,
}: PremiumAlertProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const handlePress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onDismiss();
  };

  const renderButtons = () => {
    // If only one button, render it full width
    if (buttons.length === 1) {
      return (
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.buttonPrimary,
              pressed && styles.buttonPressed,
              { flex: 1 },
            ]}
            onPress={() => handlePress(buttons[0])}
          >
            <Text style={styles.buttonTextPrimary}>{buttons[0].text}</Text>
          </Pressable>
        </View>
      );
    }

    // Side by side buttons
    return (
      <View style={styles.buttonRow}>
        {buttons.map((btn, index) => {
          const isCancel = btn.style === 'cancel';
          const isDestructive = btn.style === 'destructive';
          
          let btnStyle = styles.buttonPrimary;
          let textStyle = styles.buttonTextPrimary;
          
          if (isCancel) {
            btnStyle = styles.buttonCancel;
            textStyle = styles.buttonTextCancel;
          } else if (isDestructive) {
            btnStyle = styles.buttonDestructive;
            textStyle = styles.buttonTextDestructive;
          } else if (variant === 'horizontal' && buttons.length > 2) {
             // For multiple horizontal buttons (like cookies prompt)
             btnStyle = styles.buttonCancel;
             textStyle = styles.buttonTextCancel;
             if (index === buttons.length -1) {
                 btnStyle = styles.buttonSuccess;
                 textStyle = styles.buttonTextSuccess;
             }
          }

          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.button,
                btnStyle,
                pressed && styles.buttonPressed,
                { flex: 1, marginLeft: index > 0 ? 12 : 0 },
              ]}
              onPress={() => handlePress(btn)}
            >
              <Text style={textStyle}>{btn.text}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const isCentered = variant === 'centered';

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          
          {isCentered ? (
            // CENTERED VARIANT
            <View style={styles.centeredContent}>
              {iconName && (
                <View style={styles.iconContainerCentered}>
                  <Ionicons name={iconName} size={28} color={Theme.colors.mutedFg} />
                </View>
              )}
              <Text style={styles.titleCentered}>{title}</Text>
              {message && <Text style={styles.messageCentered}>{message}</Text>}
            </View>
          ) : (
            // HORIZONTAL VARIANT
            <View style={styles.horizontalContent}>
              <View style={styles.horizontalHeader}>
                {iconName && (
                  <View style={styles.iconContainerHorizontal}>
                    <Ionicons name={iconName} size={20} color={Theme.colors.fg} />
                  </View>
                )}
                <Text style={styles.titleHorizontal}>{title}</Text>
                <Pressable onPress={onDismiss} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color={Theme.colors.mutedFg} />
                </Pressable>
              </View>
              {message && <Text style={styles.messageHorizontal}>{message}</Text>}
            </View>
          )}

          {renderButtons()}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(240, 244, 250, 0.7)', // Light slightly blurred feel
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // Centered Variant
  centeredContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainerCentered: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleCentered: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.fg,
    textAlign: 'center',
    marginBottom: 8,
  },
  messageCentered: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.mutedFg,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Horizontal Variant
  horizontalContent: {
    marginBottom: 20,
  },
  horizontalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainerHorizontal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleHorizontal: {
    flex: 1,
    fontSize: 17,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.fg,
  },
  closeButton: {
    padding: 4,
  },
  messageHorizontal: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.mutedFg,
    lineHeight: 20,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12, // For newer React Native versions, otherwise margin is handled in mapping
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999, // Pill shape like the design
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  
  // Button Styles
  buttonPrimary: {
    backgroundColor: Theme.colors.primary,
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    fontSize: 14,
  },
  
  buttonCancel: {
    backgroundColor: Theme.colors.muted,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  buttonTextCancel: {
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.semibold,
    fontWeight: '600',
    fontSize: 14,
  },

  buttonDestructive: {
    backgroundColor: Theme.colors.danger,
  },
  buttonTextDestructive: {
    color: '#FFFFFF',
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    fontSize: 14,
  },
  
  buttonSuccess: {
    backgroundColor: Theme.colors.successLight,
  },
  buttonTextSuccess: {
    color: Theme.colors.successDark,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    fontSize: 14,
  }
});
