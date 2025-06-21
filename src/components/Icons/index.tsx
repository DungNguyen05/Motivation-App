import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Icon Props Interface
interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

// Default Icon Styles
const iconStyles = StyleSheet.create({
  // Clock Icon Styles
  clockIcon: {
    // Add custom styles here if needed
  },
  
  // Bell Icon Styles  
  bellIcon: {
    // Add custom styles here if needed
  },
  
  // Container styles for different button types
  lightBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  darkBackground: {
    backgroundColor: '#474749',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Clock/Alarm Icon Component
export const ClockIcon: React.FC<IconProps> = ({ 
  size = 22, 
  color = "#000000", 
  style 
}) => (
  <View style={[iconStyles.clockIcon, style]}>
    <Svg width={size} height={size} fill={color} viewBox="0 0 256 256">
      <Path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,216ZM61.66,37.66l-32,32A8,8,0,0,1,18.34,58.34l32-32A8,8,0,0,1,61.66,37.66Zm176,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,237.66,69.66ZM184,128a8,8,0,0,1,0,16H128a8,8,0,0,1-8-8V80a8,8,0,0,1,16,0v48Z" />
    </Svg>
  </View>
);

// Bell Icon Component
export const BellIcon: React.FC<IconProps> = ({ 
  size = 22, 
  color = "#000000", 
  style 
}) => (
  <View style={[iconStyles.bellIcon, style]}>
    <Svg width={size} height={size} fill={color} viewBox="0 0 256 256">
      <Path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />
    </Svg>
  </View>
);

// Pre-styled Icon Components for easy use
export const ClockIconLight: React.FC<Omit<IconProps, 'color'>> = ({ 
  size = 22, 
  style 
}) => (
  <View style={[iconStyles.lightBackground, style]}>
    <ClockIcon size={size} color="#000000" />
  </View>
);

export const BellIconDark: React.FC<Omit<IconProps, 'color'>> = ({ 
  size = 22, 
  style 
}) => (
  <View style={[iconStyles.darkBackground, style]}>
    <BellIcon size={size} color="#ffffff" />
  </View>
);

// Export styles for external use
export { iconStyles };

// Icon Library - Easy to add more icons
export const Icons = {
  Clock: ClockIcon,
  Bell: BellIcon,
  ClockLight: ClockIconLight,
  BellDark: BellIconDark,
};

// Default export
export default Icons;