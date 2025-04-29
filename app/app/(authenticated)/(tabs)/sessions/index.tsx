import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import SessionsListItem from '@/components/sessions/sessions-list-item';
import { FloatingActionButton } from '@/components/floating-action-button';

import { useSearchStore } from '@/lib/search-store';

import { axiosClient } from '@/lib/axios';
import { Colors } from '@/constants/Colors';
import type { GaitSessionListItem, PaginatedResponse } from '@/types';

export default function SessionsPage() {
  const router = useRouter();
  const { searchValue } = useSearchStore();

  const {
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: [`sessions_${searchValue}`],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await axiosClient.get<
        PaginatedResponse<GaitSessionListItem>
      >('gait-sessions', {
        params: {
          page: pageParam,
          search: searchValue,
        },
      });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  const sessions = data?.pages.flat().flatMap((page) => page.items) || [];

  return (
    <SafeAreaView style={styles.container}>
      <FlashList
        data={sessions}
        renderItem={({ item }) => <SessionsListItem session={item} />}
        estimatedItemSize={80}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage && !isRefetching) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isFetching ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No sessions found</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetching || isFetchingNextPage ? (
            <ActivityIndicator
              size='large'
              color={Colors.primary}
              style={styles.loader}
            />
          ) : null
        }
      />

      <FloatingActionButton onPress={() => router.push('/session/new')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.lightText,
  },
  loader: {
    padding: 20,
  },
});
