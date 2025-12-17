import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { trpc } from '../src/utils/trpc';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;

    const janCodeMatch = data.match(/^\d{13}$/);
    if (!janCodeMatch) {
      alert('有効なJANコードではありません');
      setScanned(true);
      setTimeout(() => setScanned(false), 2000);
      return;
    }

    setScanned(true);

    try {
      const item = await utils.inventory.getByJanCode.fetch({ janCode: data });

      if (item) {
        router.push(`/item/${item.id}`);
      } else {
        const shouldCreate = confirm(
          `JANコード ${data} の商品が見つかりません。\n新規登録しますか?`,
        );
        if (shouldCreate) {
          router.push(`/add?janCode=${data}`);
        } else {
          setScanned(false);
        }
      }
    } catch (error) {
      alert('エラーが発生しました');
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>カメラの権限を確認中...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>カメラの使用を許可してください</Text>
        <Button onPress={requestPermission} title="許可する" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <Text style={styles.scanText}>JANコードをスキャンしてください</Text>
          </View>
        </View>
      </CameraView>

      {scanned && (
        <View style={styles.resetContainer}>
          <Button title="再スキャン" onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 300,
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  resetContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
