import React, { useState } from 'react';
import { StyleSheet, View, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Scanner from '../../components/Scanner';

export default function QRCodeScanner() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(true);

  const onCodeScanned = (type: string, data: string) => {
    navigation.navigate('PixPayment', { qrCodeData: data });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modal}>
          <Scanner onCodeScanned={onCodeScanned} />
          <Button 
            title="Cancelar" 
            onPress={() => {
              setModalVisible(false);
              navigation.goBack();
            }} 
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'lightgrey',
  },
});