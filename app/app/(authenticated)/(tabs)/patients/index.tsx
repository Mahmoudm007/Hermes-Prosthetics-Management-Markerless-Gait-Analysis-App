import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlphabetList, type IData } from 'react-native-section-alphabet-list';
import { useInfiniteQuery } from '@tanstack/react-query';

import PatientsListItem from '@/components/patients-list-item';
import { FloatingActionButton } from '@/components/floating-action-button';

import { useSearchStore } from '@/lib/search-store';
import { axiosClient } from '@/lib/axios';
import { Colors } from '@/constants/Colors';
import type { PaginatedResponse, PatientListItem } from '@/types';

export default function PatientsPage() {
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
    queryKey: [`patients_${searchValue}`],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await axiosClient.get<PaginatedResponse<PatientListItem>>(
        'patients',
        {
          params: {
            page: pageParam,
            search: searchValue,
          },
        }
      );
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

  const patients =
    data?.pages
      .flat()
      .map((page) => page.items)
      .flat() || [];

  return (
    <SafeAreaView style={styles.container}>
      <AlphabetList
        data={patients.map((patient, index) => ({
          ...patient,
          value: `${patient.firstName} ${patient.lastName}`,
          name: `${patient.firstName} ${patient.lastName}`,
          key: `${patient.firstName} ${patient.lastName}-${index}`,
        }))}
        indexLetterStyle={{
          color: Colors.primary,
          fontSize: 12,
        }}
        indexContainerStyle={{
          width: 16,
          backgroundColor: Colors.background,
        }}
        // @ts-ignore
        renderCustomItem={(item: IData & PatientListItem) => (
          <PatientsListItem key={item.id} patient={item} />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        renderCustomSectionHeader={(section) => (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </View>
        )}
        getItemHeight={() => 80}
        sectionHeaderHeight={30}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage && !isRefetching) {
            fetchNextPage();
          }
        }}
        ListFooterComponent={
          isFetching || isFetchingNextPage ? (
            <ActivityIndicator size='large' color={Colors.primary} />
          ) : null
        }
      />
      <FloatingActionButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: Colors.background,
  },
  sectionHeaderContainer: {
    height: 30,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  sectionHeaderText: {
    color: '#6E6E73',
    marginBottom: 10,
  },
});
