import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { trpc } from '../../src/utils/trpc';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: item, isLoading } = trpc.inventory.getById.useQuery({ id });
  const updateQuantity = trpc.inventory.updateQuantity.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
      utils.inventory.getById.invalidate({ id });
    },
  });
  const deleteItem = trpc.inventory.delete.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
      router.back();
    },
  });

  const [quantityDelta, setQuantityDelta] = useState('1');

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centerContainer}>
        <Text>商品が見つかりません</Text>
      </View>
    );
  }

  const handleAddQuantity = () => {
    const delta = Number.parseInt(quantityDelta, 10);
    if (Number.isNaN(delta) || delta === 0) {
      Alert.alert('エラー', '有効な数量を入力してください');
      return;
    }
    updateQuantity.mutate({ id, delta });
  };

  const handleSubtractQuantity = () => {
    const delta = Number.parseInt(quantityDelta, 10);
    if (Number.isNaN(delta) || delta === 0) {
      Alert.alert('エラー', '有効な数量を入力してください');
      return;
    }
    updateQuantity.mutate({ id, delta: -delta });
  };

  const handleDelete = () => {
    Alert.alert('削除確認', 'この商品を削除しますか?', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => deleteItem.mutate({ id }),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>商品名</Text>
          <Text style={styles.value}>{item.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>JANコード</Text>
          <Text style={styles.value}>{item.janCode}</Text>
        </View>

        {item.description && (
          <View style={styles.section}>
            <Text style={styles.label}>説明</Text>
            <Text style={styles.value}>{item.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>価格</Text>
          <Text style={styles.value}>¥{item.price.toLocaleString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>在庫数</Text>
          <Text style={styles.quantityValue}>{item.quantity}</Text>
        </View>

        <View style={styles.quantityControl}>
          <Text style={styles.label}>在庫調整</Text>
          <View style={styles.quantityInputContainer}>
            <TextInput
              style={styles.quantityInput}
              value={quantityDelta}
              onChangeText={setQuantityDelta}
              keyboardType="number-pad"
              placeholder="数量"
            />
            <Pressable
              style={[styles.button, styles.addButton]}
              onPress={handleAddQuantity}
              disabled={updateQuantity.isPending}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.buttonText}>追加</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.subtractButton]}
              onPress={handleSubtractQuantity}
              disabled={updateQuantity.isPending}
            >
              <Ionicons name="remove" size={24} color="white" />
              <Text style={styles.buttonText}>削減</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
          disabled={deleteItem.isPending}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
          <Text style={styles.buttonText}>削除</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#333',
  },
  quantityValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2196F3',
  },
  quantityControl: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  quantityInputContainer: {
    gap: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  subtractButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
