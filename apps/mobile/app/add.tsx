import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { trpc } from '../src/utils/trpc';

export default function AddItemScreen() {
  const { janCode: initialJanCode } = useLocalSearchParams<{ janCode?: string }>();
  const router = useRouter();
  const utils = trpc.useUtils();

  const [janCode, setJanCode] = useState(initialJanCode || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('0');

  const createItem = trpc.inventory.create.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
      Alert.alert('成功', '商品を登録しました', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert('エラー', error.message);
    },
  });

  const handleSubmit = () => {
    if (!janCode || janCode.length !== 13 || !/^\d{13}$/.test(janCode)) {
      Alert.alert('エラー', 'JANコードは13桁の数字で入力してください');
      return;
    }

    if (!name.trim()) {
      Alert.alert('エラー', '商品名を入力してください');
      return;
    }

    const priceNum = Number.parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      Alert.alert('エラー', '有効な価格を入力してください');
      return;
    }

    const quantityNum = Number.parseInt(quantity, 10);
    if (Number.isNaN(quantityNum) || quantityNum < 0) {
      Alert.alert('エラー', '有効な在庫数を入力してください');
      return;
    }

    createItem.mutate({
      janCode,
      name: name.trim(),
      description: description.trim() || undefined,
      price: priceNum,
      quantity: quantityNum,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>
            JANコード <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={janCode}
            onChangeText={setJanCode}
            placeholder="13桁の数字"
            keyboardType="number-pad"
            maxLength={13}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            商品名 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="商品名を入力"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>説明</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="商品の説明"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            価格 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            初期在庫数 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="0"
            keyboardType="number-pad"
          />
        </View>

        <Pressable
          style={[styles.submitButton, createItem.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createItem.isPending}
        >
          <Text style={styles.submitButtonText}>
            {createItem.isPending ? '登録中...' : '登録'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#F44336',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
