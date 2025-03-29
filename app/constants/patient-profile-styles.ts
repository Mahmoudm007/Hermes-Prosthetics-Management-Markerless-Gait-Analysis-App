import { Colors } from '@/constants/Colors';
import { StyleSheet } from 'react-native';

export const patientProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2c3e50',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    padding: 15,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DCDCE2',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#2c3e50',
  },
  cardsContainer: {
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#2c3e50',
  },
  cardContent: {
    paddingLeft: 32,
  },
  cardDetail: {
    fontSize: 14,
    color: Colors.dark,
    marginBottom: 3,
  },
});
