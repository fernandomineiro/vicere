import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CONFIG } from '../../config/global';

export default function BottomMenu() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentScreen = route.name;

  const getIconColor = (screenNames) => {
    if (typeof screenNames === 'string') {
      return currentScreen === screenNames ? CONFIG.COLORS.primary : CONFIG.COLORS.text;
    }
    return screenNames.includes(currentScreen) ? CONFIG.COLORS.primary : CONFIG.COLORS.text;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Image
          source={require('../../../assets/home-icon.png')}
          style={[styles.icon, { tintColor: getIconColor('Dashboard') }]}
        />
        <Text style={[styles.menuText, { color: getIconColor('Dashboard') }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => navigation.navigate('PayBills')}
      >
        <Image
          source={require('../../../assets/pay-icon.png')}
          style={[styles.icon, { tintColor: getIconColor('PayBills') }]}
        />
        <Text style={[styles.menuText, { color: getIconColor('PayBills') }]}>Pagar Contas</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => navigation.navigate('Shopping')}
      >
        <Image
          source={require('../../../assets/cart-icon.png')}
          style={[styles.icon, { tintColor: getIconColor('Shopping') }]}
        />
        <Text style={[styles.menuText, { color: getIconColor('Shopping') }]}>Shopping</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => navigation.navigate('Profile')}
      >
        <Image
          source={require('../../../assets/profile-icon.png')}
          style={[styles.icon, {
            tintColor: getIconColor(['Profile', 'Address', 'MyCards', 'UserData', 'Security', 'MyPurchases', 'Notifications', 'BankAccounts'])
          }]}
        />
        <Text 
          style={[styles.menuText, { 
            color: getIconColor(['Profile', 'Address', 'MyCards', 'UserData', 'Security', 'MyPurchases', 'Notifications', 'BankAccounts'])
          }]}
        >
          Minha Conta
        </Text>
      
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => navigation.navigate('About')}
      >
        <Image
          source={require('../../../assets/logo-icon.png')}
          style={[styles.icon, { tintColor: getIconColor('About') }]}
        />
        <Text style={[styles.menuText, { color: getIconColor('About') }]}>Sobre</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CONFIG.COLORS.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    height: 70,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: CONFIG.COLORS.text,
    marginBottom: 4,
  },
  menuText: {
    fontSize: 12,
    color: CONFIG.COLORS.text,
    textAlign: 'center',
  },
});