import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Divider, List } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { CocktailWithMatch } from '../types';

export default function CocktailDetailScreen() {
  const route = useRoute();
  const { cocktail } = route.params as { cocktail: CocktailWithMatch };

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

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            {cocktail.name}
          </Text>

          <View style={styles.tags}>
            <Chip mode="outlined" compact>
              {cocktail.category}
            </Chip>
            <Chip
              mode="outlined"
              compact
              style={{ borderColor: getDifficultyColor(cocktail.difficulty) }}
              textStyle={{ color: getDifficultyColor(cocktail.difficulty) }}
            >
              {cocktail.difficulty}
            </Chip>
            {cocktail.canMake && (
              <Chip mode="flat" style={styles.canMakeChip} textStyle={{ color: 'white' }}>
                Can Make!
              </Chip>
            )}
          </View>

          {cocktail.glassType && (
            <View style={styles.section}>
              <Text variant="labelLarge">Glass Type</Text>
              <Text variant="bodyMedium">{cocktail.glassType}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Ingredients
          </Text>
          {cocktail.ingredients.map((ingredient, index) => (
            <List.Item
              key={index}
              title={ingredient.name}
              description={ingredient.amount}
              left={props => (
                <List.Icon
                  {...props}
                  icon={ingredient.isAlcohol ? 'bottle-wine' : 'food-apple'}
                />
              )}
              titleStyle={
                ingredient.isAlcohol &&
                ingredient.alcoholType &&
                cocktail.missingAlcohol.includes(ingredient.alcoholType)
                  ? styles.missingIngredient
                  : undefined
              }
            />
          ))}

          {!cocktail.canMake && cocktail.missingAlcohol.length > 0 && (
            <View style={styles.missingSection}>
              <Text variant="bodyMedium" style={styles.missingText}>
                You're missing: {cocktail.missingAlcohol.join(', ')}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Instructions
          </Text>
          <Text variant="bodyLarge" style={styles.instructions}>
            {cocktail.instructions}
          </Text>
        </Card.Content>
      </Card>

      {cocktail.garnish && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Garnish
            </Text>
            <Text variant="bodyLarge">{cocktail.garnish}</Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 0,
  },
  title: {
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  canMakeChip: {
    backgroundColor: '#4CAF50',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  instructions: {
    lineHeight: 24,
  },
  missingSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  missingText: {
    color: '#F44336',
  },
  missingIngredient: {
    color: '#F44336',
    textDecorationLine: 'line-through',
  },
  bottomSpacer: {
    height: 24,
  },
});
