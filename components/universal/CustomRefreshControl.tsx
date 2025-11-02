import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

interface CustomRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  colors?: readonly [string, string, ...string[]];
  progressBackgroundColor?: string;
  size?: 'default' | 'large';
  tintColor?: string;
  title?: string;
  titleColor?: string;
  progressViewOffset?: number;
  enabled?: boolean;
}

const REFRESH_HEIGHT = 60;

export const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
  onRefresh,
  colors = ['#667eea', '#764ba2'],
  progressBackgroundColor = '#ffffff',
  size = 'default',
  tintColor = '#667eea',
  title = 'Pull to refresh',
  titleColor = '#ffffff',
  progressViewOffset = 0,
  enabled = true,
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (refreshing) {
      startRefreshAnimation();
    } else {
      stopRefreshAnimation();
    }
  }, [refreshing]);

  const startRefreshAnimation = () => {
    lottieRef.current?.play();
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation during refresh
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRefreshAnimation = () => {
    lottieRef.current?.pause();
    rotateValue.stopAnimation();
    
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotateValue.setValue(0);
    });
  };

  // This component now acts like the native RefreshControl
  // The pull-to-refresh logic is handled by the ScrollView itself

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const refreshIndicatorStyle = {
    transform: [
      { scale: scaleValue },
      { rotate: refreshing ? spin : '0deg' },
    ],
    opacity: refreshing ? opacityValue : 0,
  };

  // Return the custom refresh indicator that will be used by ScrollView
  return (
    <Animated.View
      style={[
        styles.refreshContainer,
        {
          backgroundColor: progressBackgroundColor,
        },
        refreshIndicatorStyle,
      ]}
    >
      <LinearGradient
        colors={colors}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.indicatorContent}>
          {refreshing ? (
            <>
              <LottieView
                ref={lottieRef}
                source={require('../../assets/json/refresh.json')}
                style={[
                  styles.lottieAnimation,
                  { width: size === 'large' ? 40 : 30, height: size === 'large' ? 40 : 30 }
                ]}
                loop
                autoPlay={false}
              />
              {title && (
                <Text style={[styles.titleText, { color: titleColor }]}>
                  Refreshing...
                </Text>
              )}
            </>
          ) : (
            <>
              <ActivityIndicator
                size={size === 'large' ? 'large' : 'small'}
                color={tintColor}
                style={styles.activityIndicator}
              />
              {title && (
                <Text style={[styles.titleText, { color: titleColor }]}>
                  {title}
                </Text>
              )}
            </>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  refreshContainer: {
    height: REFRESH_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  indicatorContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  lottieAnimation: {
    width: 30,
    height: 30,
  },
  activityIndicator: {
    marginBottom: 4,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#ffffff',
  },
});

export default CustomRefreshControl;