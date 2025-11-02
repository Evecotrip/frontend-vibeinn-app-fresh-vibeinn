import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CustomRefreshControl } from './CustomRefreshControl';

// Example usage of CustomRefreshControl
export const CustomRefreshControlExample: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update data
    setData(prev => [...prev, `Item ${prev.length + 1}`, `Item ${prev.length + 2}`]);
    
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <CustomRefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#667eea', '#764ba2']} // Beautiful gradient colors
          title="Pull to refresh"
          titleColor="#ffffff"
          tintColor="#ffffff"
          size="default"
          enabled={true}
        />
      }
    >
      <View style={styles.content}>
        <Text style={styles.header}>Custom Refresh Control Demo</Text>
        <Text style={styles.subtitle}>Pull down to refresh the list</Text>
        
        {data.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Alternative usage with different styling
export const CustomRefreshControlAlternative: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      refreshControl={
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
        />
      }
    >
      <View style={styles.content}>
        <Text style={styles.header}>Alternative Style</Text>
        <Text style={styles.subtitle}>Different colors and larger size</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Card Content</Text>
          <Text style={styles.cardText}>
            This is an example of how the CustomRefreshControl can be used
            with different styling options. The component supports:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Lottie animations during refresh</Text>
            <Text style={styles.feature}>• Customizable gradient colors</Text>
            <Text style={styles.feature}>• Smooth pull-to-refresh gestures</Text>
            <Text style={styles.feature}>• Progress indicators</Text>
            <Text style={styles.feature}>• Custom titles and colors</Text>
            <Text style={styles.feature}>• Same API as RefreshControl</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  listItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
});

export default CustomRefreshControlExample;
