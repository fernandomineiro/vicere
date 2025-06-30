import { createNativeStackNavigator } from '@react-navigation/native-stack';
// ... outros imports ...

const Stack = createNativeStackNavigator();

export function Routes() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right', // animação padrão para entrada
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animationTypeForReplace: 'push',
        animation: Platform.select({
          ios: 'default',
          android: 'slide_from_right'
        }),
      }}
    >
      // ... suas rotas aqui ...
    </Stack.Navigator>
  );
}