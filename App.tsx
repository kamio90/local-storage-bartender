import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider, Appbar } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { initDatabase } from './src/database/init';
import { populateCocktailDatabase } from './src/database/populateCocktails';
import { lightTheme, darkTheme } from './src/utils/theme';

import InventoryScreen from './src/screens/InventoryScreen';
import CocktailsScreen from './src/screens/CocktailsScreen';
import CocktailDetailScreen from './src/screens/CocktailDetailScreen';
import CameraScreen from './src/screens/CameraScreen';
import AddBottleScreen from './src/screens/AddBottleScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function InventoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Appbar.Header><Appbar.Content title={props.options.title || 'Inventory'} /></Appbar.Header>,
      }}
    >
      <Stack.Screen name="InventoryMain" component={InventoryScreen} options={{ title: 'My Bar' }} />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddBottle" component={AddBottleScreen} options={{ title: 'Add Bottle' }} />
    </Stack.Navigator>
  );
}

function CocktailsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Appbar.Header><Appbar.Content title={props.options.title || 'Cocktails'} /></Appbar.Header>,
      }}
    >
      <Stack.Screen name="CocktailsMain" component={CocktailsScreen} options={{ title: 'Cocktails' }} />
      <Stack.Screen name="CocktailDetail" component={CocktailDetailScreen} options={{ title: 'Recipe' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await initDatabase();
      await populateCocktailDatabase();
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  if (!isReady) {
    return null;
  }

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: any;

              if (route.name === 'Inventory') {
                iconName = focused ? 'bottle-wine' : 'bottle-wine-outline';
              } else if (route.name === 'Cocktails') {
                iconName = focused ? 'glass-cocktail' : 'glass-cocktail';
              }

              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Inventory" component={InventoryStack} />
          <Tab.Screen name="Cocktails" component={CocktailsStack} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
