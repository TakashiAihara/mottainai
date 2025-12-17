import { Stack } from 'expo-router';
import { queryClient, trpc, trpcClient } from '../src/utils/trpc';

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ title: '在庫一覧' }} />
        <Stack.Screen name="scanner" options={{ title: 'バーコードスキャン' }} />
        <Stack.Screen name="item/[id]" options={{ title: '商品詳細' }} />
        <Stack.Screen name="add" options={{ title: '商品追加' }} />
      </Stack>
    </trpc.Provider>
  );
}
