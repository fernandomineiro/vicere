export type RootStackParamList = {
  Home: undefined;
  Shopping: undefined;
  ProductDetails: { productId: string };
  Cart: { productId: string };  // Garantindo que productId é obrigatório
  Dashboard: undefined;
  BuyPoints: undefined;
  TransferPoints: undefined;
  PayBills: undefined;
  BarcodeScanner: undefined;
  QRCodeScanner: undefined;
  PixPayment: undefined;
  PixWithdraw: undefined; // Add this line
};