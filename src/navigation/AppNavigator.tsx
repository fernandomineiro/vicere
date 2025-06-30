import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Shopping from '../screens/Shopping';
import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import Cadastro from '../screens/Cadastro';
import CadastroSucesso from '../screens/CadastroSucesso';
import RecuperarSenha from '../screens/RecuperarSenha';
import ValidarCodigo from '../screens/ValidarCodigo';
import Dashboard from '../screens/Dashboard';
import CategoryProducts from '../screens/CategoryProducts';
import ProductDetails from '../screens/ProductDetails';
import Cart from '../screens/Cart';
import Checkout from '../screens/Checkout';
import BuyPoints from '../screens/BuyPoints';
import PaymentScreen from '../screens/PaymentScreen';
import ThankYou from '../screens/ThankYou';
import TransferPoints from '../screens/TransferPoints';
import PayBills from '../screens/PayBills';
import PixWithdraw from '../screens/PixWithdraw';
import MobileRecharge from '../screens/MobileRecharge';
import Profile from '../screens/Profile';
import About from '../screens/About';
import UserData from '../screens/UserData';
import MyCards from '../screens/MyCards';
import Address from '../screens/Address';
import Statement from '../screens/Statement';
import MyPurchases from '../screens/MyPurchases';
import Security from '../screens/Security';
import Contact from '../screens/Contact';
import Notifications from '../screens/Notifications';
import BankAccounts from '../screens/BankAccounts';
import BarcodeScanner from '../screens/BarcodeScanner';
import QRCodeScanner from '../screens/QRCodeScanner';
import PixPayment from '../screens/PixPayment';
import CentralAjuda from '../screens/CentralAjuda';


const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Shopping"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Shopping" component={Shopping} />
      <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="CadastroSucesso" component={CadastroSucesso} />
        <Stack.Screen name="RecuperarSenha" component={RecuperarSenha} />
        <Stack.Screen name="ValidarCodigo" component={ValidarCodigo} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="CategoryProducts" component={CategoryProducts} />
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="BuyPoints" component={BuyPoints} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="ThankYou" component={ThankYou} />
        <Stack.Screen name="TransferPoints" component={TransferPoints} />
        <Stack.Screen name="PayBills" component={PayBills} />
        <Stack.Screen name="BarcodeScanner" component={BarcodeScanner} />
        <Stack.Screen name="QRCodeScanner" component={QRCodeScanner} />
        <Stack.Screen name="PixPayment" component={PixPayment} />
        <Stack.Screen name="PixWithdraw" component={PixWithdraw} />
        <Stack.Screen name="MobileRecharge" component={MobileRecharge} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="UserData" component={UserData} />
        <Stack.Screen name="MyCards" component={MyCards} />
        <Stack.Screen name="Address" component={Address} />
        <Stack.Screen name="Statement" component={Statement} />
        <Stack.Screen name="MyPurchases" component={MyPurchases} />
        <Stack.Screen name="Security" component={Security} />
        <Stack.Screen name="Contact" component={Contact} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="BankAccounts" component={BankAccounts} />
        <Stack.Screen name="CentralAjuda" component={CentralAjuda} />
    </Stack.Navigator>
  );
}

export default AppNavigator;