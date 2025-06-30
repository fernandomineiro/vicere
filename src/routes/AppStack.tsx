import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import CentralAjuda from '../screens/CentralAjuda';

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* ... other screens ... */}
      <Stack.Screen 
        name="CentralAjuda" 
        component={CentralAjuda} 
      />
    </Stack.Navigator>
  );
}