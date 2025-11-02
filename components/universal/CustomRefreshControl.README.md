# CustomRefreshControl

A beautiful, enhanced replacement for React Native's RefreshControl with smooth animations, Lottie integration, and modern UI design.

## Features

✨ **Enhanced UI**: Beautiful gradient backgrounds with rounded corners and shadows  
🎭 **Lottie Animations**: Integrated Lottie animation support during refresh  
🎨 **Customizable**: Extensive customization options for colors, sizes, and text  
📱 **Smooth Gestures**: Fluid pull-to-refresh interactions with visual feedback  
⚡ **Performance**: Optimized animations using native driver  
🔄 **Drop-in Replacement**: Same API as React Native's RefreshControl  

## Installation

Make sure you have the required dependencies installed:

```bash
npm install lottie-react-native react-native-gesture-handler expo-linear-gradient
# or
yarn add lottie-react-native react-native-gesture-handler expo-linear-gradient
```

## Basic Usage

```tsx
import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { CustomRefreshControl } from './components/universal/CustomRefreshControl';

const MyComponent = () => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Your refresh logic here
    await fetchData();
    setRefreshing(false);
  };

  return (
    <CustomRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <ScrollView>
        {/* Your content here */}
        <View>
          <Text>Pull down to refresh!</Text>
        </View>
      </ScrollView>
    </CustomRefreshControl>
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `refreshing` | `boolean` | **Required** | Whether the view should be indicating an active refresh |
| `onRefresh` | `() => void` | **Required** | Called when the view starts refreshing |
| `children` | `React.ReactNode` | **Required** | The scrollable content |
| `colors` | `readonly [string, string, ...string[]]` | `['#667eea', '#764ba2']` | Gradient colors for the refresh indicator |
| `progressBackgroundColor` | `string` | `'#ffffff'` | Background color of the refresh indicator |
| `size` | `'default' \| 'large'` | `'default'` | Size of the refresh indicator |
| `tintColor` | `string` | `'#667eea'` | Color of the pull indicator |
| `title` | `string` | `'Pull to refresh'` | Text displayed below the indicator |
| `titleColor` | `string` | `'#666666'` | Color of the title text |
| `progressViewOffset` | `number` | `0` | Top offset for the refresh indicator |
| `enabled` | `boolean` | `true` | Whether pull-to-refresh is enabled |

## Advanced Usage

### Custom Colors and Styling

```tsx
<CustomRefreshControl
  refreshing={refreshing}
  onRefresh={onRefresh}
  colors={['#ff9a9e', '#fecfef', '#fecfef']} // Pink gradient
  progressBackgroundColor="#ffffff"
  title="Refresh Content"
  titleColor="#ff6b6b"
  tintColor="#ff6b6b"
  size="large"
  progressViewOffset={10}
>
  {/* Your content */}
</CustomRefreshControl>
```

### With FlatList

```tsx
<CustomRefreshControl
  refreshing={refreshing}
  onRefresh={onRefresh}
  colors={['#4facfe', '#00f2fe']} // Blue gradient
>
  <FlatList
    data={data}
    renderItem={renderItem}
    keyExtractor={(item) => item.id}
  />
</CustomRefreshControl>
```

## Animation States

The component provides visual feedback through different states:

1. **Idle**: No visual indicator
2. **Pulling**: Shows pull indicator with rotation animation
3. **Can Refresh**: Indicator reaches trigger point, text changes to "Release to refresh"
4. **Refreshing**: Displays Lottie animation with "Refreshing..." text
5. **Completing**: Smooth transition back to idle state

## Lottie Animation

The component uses the `refresh.json` Lottie animation file located in `assets/json/refresh.json`. The animation automatically plays during the refresh state and provides a smooth, engaging user experience.

## Customization Tips

### Color Schemes

```tsx
// Modern Blue
colors={['#667eea', '#764ba2']}

// Sunset Orange
colors={['#ff9a9e', '#fecfef']}

// Ocean Blue
colors={['#4facfe', '#00f2fe']}

// Forest Green
colors={['#56ab2f', '#a8e6cf']}
```

### Responsive Sizing

The component automatically adapts to different screen sizes and orientations. Use the `size` prop to adjust the indicator size for different use cases.

## Performance Considerations

- All animations use the native driver for optimal performance
- Lottie animations are paused when not in use
- Gesture handling is optimized for smooth interactions
- Memory usage is minimized through proper cleanup

## Compatibility

- ✅ iOS
- ✅ Android
- ✅ Expo
- ✅ React Native CLI
- ✅ TypeScript

## Migration from RefreshControl

Simply replace your existing RefreshControl usage:

```tsx
// Before
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  }
>

// After
<CustomRefreshControl
  refreshing={refreshing}
  onRefresh={onRefresh}
>
  <ScrollView>
```

## Troubleshooting

### Common Issues

1. **Gesture not working**: Ensure `react-native-gesture-handler` is properly installed and linked
2. **Lottie not showing**: Check that the `refresh.json` file exists in `assets/json/`
3. **TypeScript errors**: Make sure all dependencies have proper type definitions

### Dependencies

Make sure these packages are installed and properly configured:

- `lottie-react-native`
- `react-native-gesture-handler`
- `expo-linear-gradient` (or `react-native-linear-gradient`)

## License

MIT License - feel free to use in your projects!
