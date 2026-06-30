export const Theme = {
  colors: {
    // Page & card surfaces
    bg: '#F8FAFC',          // Slate 50
    card: '#FFFFFF',        // White
    border: '#E2E8F0',      // Slate 200
    
    // Text colors
    fg: '#0F172A',          // Slate 900
    mutedFg: '#64748B',     // Slate 500
    
    // Interaction states
    primary: '#2563EB',     // Blue 600 (Main CTA)
    accent: '#EFF6FF',      // Blue 50 (Input focus background)
    muted: '#F1F5F9',       // Slate 100 (Unselected tabs / Pill track)
    
    // Status indicators
    success: '#10B981',     // Emerald 500 (Paid / Active / Online)
    successLight: '#ECFDF5',// Emerald 50 (Paid badge background)
    successDark: '#065F46', // Emerald 800 (Paid badge text)
    
    // Warnings (Pending actions)
    warning: '#F59E0B',     // Amber 500
    warningLight: '#FFFBEB',// Amber 50
    warningDark: '#92400E', // Amber 800
    
    // Danger / Alerts (Urgent requests / Delete actions)
    danger: '#EF4444',      // Red 500
    dangerLight: '#FEE2E2', // Red 50
    dangerDark: '#991B1B',  // Red 800
    
    // Gradients
    g1: '#1D4ED8',          // Blue 700
    g3: '#3B82F6',          // Blue 500
  },
  radius: {
    xs: 8,                  // Small icons / badges
    sm: 10,                 // Sub-buttons
    md: 12,                 // Input fields / standard buttons
    lg: 14,                 // Standard cards
    xl: 18,                 // Large content containers
    xxl: 24,                // Property hero cards / onboarding cards
    round: 9999,            // Circular buttons / Avatars
  },
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  }
};
