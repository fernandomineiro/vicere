import PayBills from './screens/PayBills';

// ... other imports ...

const Stack = createNativeStackNavigator<RootStackParamList>();

// Inside the Navigator component
<Stack.Navigator>
  {/* ... other screens ... */}
  <Stack.Screen 
    name="PixWithdraw" 
    component={PixWithdraw} 
    options={{ headerShown: false }}
  />
</Stack.Navigator>