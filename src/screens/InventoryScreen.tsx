import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { FAB, Card, Text, Chip, IconButton, Searchbar, Menu, Button } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Bottle, AlcoholCategory } from '../types';
import { getAllBottles, deleteBottle, updateBottleStatus } from '../database/bottleOperations';
import { deleteImage } from '../utils/storage';

export default function InventoryScreen() {
  const navigation = useNavigation();
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [filteredBottles, setFilteredBottles] = useState<Bottle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<AlcoholCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState<{ [key: number]: boolean }>({});

  const loadBottles = async () => {
    try {
      const allBottles = await getAllBottles();
      setBottles(allBottles);
      setFilteredBottles(allBottles);
    } catch (error) {
      Alert.alert('Error', 'Failed to load bottles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBottles();
    }, [])
  );

  useEffect(() => {
    filterBottles();
  }, [searchQuery, filterCategory, bottles]);

  const filterBottles = () => {
    let filtered = bottles;

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(b => b.category === filterCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBottles(filtered);
  };

  const handleStatusChange = async (bottle: Bottle, newStatus: 'full' | 'low' | 'empty') => {
    try {
      await updateBottleStatus(bottle.id, newStatus);
      loadBottles();
    } catch (error) {
      Alert.alert('Error', 'Failed to update bottle status');
    }
  };

  const handleDelete = async (bottle: Bottle) => {
    Alert.alert(
      'Delete Bottle',
      `Are you sure you want to delete ${bottle.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBottle(bottle.id);
              await deleteImage(bottle.photoUri);
              loadBottles();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete bottle');
            }
          },
        },
      ]
    );
  };

  const toggleMenu = (id: number) => {
    setMenuVisible(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'full':
        return '#4CAF50';
      case 'low':
        return '#FF9800';
      case 'empty':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderBottle = ({ item }: { item: Bottle }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
        <View style={styles.info}>
          <Text variant="titleMedium">{item.name}</Text>
          <View style={styles.tags}>
            <Chip mode="outlined" compact>
              {item.category}
            </Chip>
            <Chip
              mode="flat"
              compact
              style={{ backgroundColor: getStatusColor(item.status) }}
              textStyle={{ color: 'white' }}
            >
              {item.status}
            </Chip>
          </View>
          {item.notes && (
            <Text variant="bodySmall" numberOfLines={2} style={styles.notes}>
              {item.notes}
            </Text>
          )}
        </View>
        <Menu
          visible={menuVisible[item.id]}
          onDismiss={() => toggleMenu(item.id)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => toggleMenu(item.id)}
            />
          }
        >
          <Menu.Item
            leadingIcon="check-circle"
            onPress={() => {
              handleStatusChange(item, 'full');
              toggleMenu(item.id);
            }}
            title="Mark as Full"
          />
          <Menu.Item
            leadingIcon="alert-circle"
            onPress={() => {
              handleStatusChange(item, 'low');
              toggleMenu(item.id);
            }}
            title="Mark as Low"
          />
          <Menu.Item
            leadingIcon="close-circle"
            onPress={() => {
              handleStatusChange(item, 'empty');
              toggleMenu(item.id);
            }}
            title="Mark as Empty"
          />
          <Menu.Item
            leadingIcon="delete"
            onPress={() => {
              toggleMenu(item.id);
              handleDelete(item);
            }}
            title="Delete"
          />
        </Menu>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search bottles..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filters}>
        <FlatList
          horizontal
          data={['all', 'vodka', 'whiskey', 'rum', 'gin', 'tequila', 'brandy', 'liqueur', 'wine', 'beer', 'other']}
          renderItem={({ item }) => (
            <Chip
              selected={filterCategory === item}
              onPress={() => setFilterCategory(item as AlcoholCategory | 'all')}
              style={styles.filterChip}
            >
              {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
            </Chip>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {filteredBottles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="headlineSmall">No bottles found</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {bottles.length === 0
              ? 'Add your first bottle by tapping the camera button'
              : 'Try adjusting your search or filters'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBottles}
          renderItem={renderBottle}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadBottles}
        />
      )}

      <FAB
        icon="camera"
        style={styles.fab}
        onPress={() => navigation.navigate('Camera' as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  filters: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  notes: {
    marginTop: 4,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
