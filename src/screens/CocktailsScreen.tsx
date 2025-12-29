import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, Chip, Searchbar, SegmentedButtons } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CocktailWithMatch } from '../types';
import { getCocktailsWithAvailability } from '../database/cocktailOperations';
import { getAvailableAlcoholTypes } from '../database/bottleOperations';

export default function CocktailsScreen() {
  const navigation = useNavigation();
  const [cocktails, setCocktails] = useState<CocktailWithMatch[]>([]);
  const [filteredCocktails, setFilteredCocktails] = useState<CocktailWithMatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadCocktails = async () => {
    try {
      const availableAlcohol = await getAvailableAlcoholTypes();
      const allCocktails = await getCocktailsWithAvailability(availableAlcohol);
      setCocktails(allCocktails);
      setFilteredCocktails(allCocktails);
    } catch (error) {
      Alert.alert('Error', 'Failed to load cocktails');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCocktails();
    }, [])
  );

  useEffect(() => {
    filterCocktails();
  }, [searchQuery, filter, cocktails]);

  const filterCocktails = () => {
    let filtered = cocktails;

    // Filter by availability
    if (filter === 'canMake') {
      filtered = filtered.filter(c => c.canMake);
    } else if (filter === 'needMore') {
      filtered = filtered.filter(c => !c.canMake && c.missingAlcohol.length <= 2);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCocktails(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderCocktail = ({ item }: { item: CocktailWithMatch }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('CocktailDetail' as never, { cocktail: item } as never)}
    >
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.name}>
            {item.name}
          </Text>
          {item.canMake && (
            <Chip mode="flat" style={styles.canMakeChip} textStyle={{ color: 'white' }}>
              Can Make!
            </Chip>
          )}
        </View>

        <View style={styles.tags}>
          <Chip mode="outlined" compact>
            {item.category}
          </Chip>
          <Chip
            mode="outlined"
            compact
            style={{ borderColor: getDifficultyColor(item.difficulty) }}
            textStyle={{ color: getDifficultyColor(item.difficulty) }}
          >
            {item.difficulty}
          </Chip>
        </View>

        <View style={styles.alcoholTypes}>
          {item.alcoholTypes.map((type, index) => (
            <Chip key={index} mode="outlined" compact style={styles.alcoholChip}>
              {type}
            </Chip>
          ))}
        </View>

        {!item.canMake && item.missingAlcohol.length > 0 && (
          <View style={styles.missing}>
            <Text variant="bodySmall" style={styles.missingText}>
              Missing: {item.missingAlcohol.join(', ')}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search cocktails..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'canMake', label: 'Can Make' },
          { value: 'needMore', label: 'Close' },
        ]}
        style={styles.segmented}
      />

      {filteredCocktails.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="headlineSmall">No cocktails found</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {cocktails.length === 0
              ? 'Add bottles to your inventory to see cocktail suggestions'
              : 'Try adjusting your search or filters'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCocktails}
          renderItem={renderCocktail}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadCocktails}
        />
      )}
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
  segmented: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    flex: 1,
  },
  canMakeChip: {
    backgroundColor: '#4CAF50',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  alcoholTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  alcoholChip: {
    marginBottom: 4,
  },
  missing: {
    marginTop: 4,
  },
  missingText: {
    color: '#F44336',
    fontStyle: 'italic',
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
});
