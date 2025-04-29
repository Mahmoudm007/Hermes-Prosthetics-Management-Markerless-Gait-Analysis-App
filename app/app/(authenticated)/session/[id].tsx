import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResizeMode, Video } from 'expo-av';
import {
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
  AntDesign,
} from '@expo/vector-icons';
import * as ContextMenu from 'zeego/context-menu';

import { axiosClient } from '@/lib/axios';
import { Colors } from '@/constants/Colors';
import {
  AnalysisStatus,
  analysisStatusLabels,
  analysisStatusColors,
  type GaitSession,
} from '@/types';
import { toast } from 'sonner-native';
import GaitAnalysisGraph from '@/components/sessions/gait-analysis-graph';
import DetailedAnalysisSheet from '@/components/sessions/detailed-analysis-sheet';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * 1.5;

export default function GaitSessionDetails() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [isOriginalPlaying, setIsOriginalPlaying] = useState(false);
  const [isAnnotatedPlaying, setIsAnnotatedPlaying] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const originalVideoRef = useRef(null);
  const annotatedVideoRef = useRef(null);

  const {
    data: gaitSession,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [`gait_session_${id}`],
    queryFn: async () => {
      const data = await axiosClient.get<GaitSession>(`gait-sessions/${id}`);
      return data.data;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return await axiosClient.patch<GaitSession>(
        `gait-sessions/${id}/analyze`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`gait_session_${id}`] });
      return toast.success(
        'AI analysis started successfully, we will notify you when it is ready.'
      );
    },
    onError: () => {
      return toast.error('Failed to start AI analysis. Please try again.');
    },
  });

  useEffect(() => {
    if (gaitSession) {
      navigation.setOptions({
        title: gaitSession.title || `Gait Session ${id}`,
      });
    }
  }, [gaitSession, id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={Colors.primary} />
          <Text style={styles.loadingText}>Loading gait session data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!gaitSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <FontAwesome5
            name='exclamation-circle'
            size={50}
            color={Colors.destructive}
          />
          <Text style={styles.errorText}>Failed to load gait session</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderStatusBadge = () => {
    const statusColor = analysisStatusColors[gaitSession.analysisStatus];
    return (
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={styles.statusText}>
          {analysisStatusLabels[gaitSession.analysisStatus]}
        </Text>
      </View>
    );
  };

  const renderAnalysisButton = () => {
    if (gaitSession.analysisStatus === AnalysisStatus.Initial) {
      return (
        <TouchableOpacity
          style={styles.analysisButton}
          onPress={() => mutate()}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator size='small' color='#fff' />
          ) : (
            <>
              <FontAwesome5
                name='brain'
                size={18}
                color='#fff'
                style={styles.buttonIcon}
              />
              <Text style={styles.analysisButtonText}>Start AI Analysis</Text>
            </>
          )}
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderAnalysisLoading = () => {
    if (
      gaitSession.analysisStatus === AnalysisStatus.Pending ||
      gaitSession.analysisStatus === AnalysisStatus.InProgress
    ) {
      return (
        <View style={styles.analysisLoadingContainer}>
          <ActivityIndicator size='large' color={Colors.primary} />
          <Text style={styles.analysisLoadingText}>
            {gaitSession.analysisStatus === AnalysisStatus.Pending
              ? 'Analysis is pending. We will notify you when it starts.'
              : 'Analysis is in progress. We will notify you when it completes.'}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderAnalysisError = () => {
    if (gaitSession.analysisStatus === AnalysisStatus.Error) {
      return (
        <View style={styles.analysisErrorContainer}>
          <FontAwesome5
            name='exclamation-triangle'
            size={30}
            color={Colors.destructive}
          />
          <Text style={styles.analysisErrorText}>
            Failed to analyze the gait session. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryAnalysisButton}
            onPress={() => mutate()}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Text style={styles.retryAnalysisButtonText}>Try Again</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Header with Status */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.sessionTitle}>
              {gaitSession.title || `Gait Session ${id}`}
            </Text>
            {renderStatusBadge()}
          </View>
          <ContextMenu.Root>
            <ContextMenu.Trigger>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons
                  name='ellipsis-vertical'
                  size={24}
                  color={Colors.dark}
                />
              </TouchableOpacity>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Item
                key='edit_session'
                onSelect={() => {
                  // Handle edit action
                  Alert.alert('Edit', 'Edit functionality to be implemented');
                }}
              >
                <ContextMenu.ItemTitle>Edit Session</ContextMenu.ItemTitle>
                <ContextMenu.ItemIcon
                  ios={{
                    name: 'pencil.circle',
                    pointSize: 18,
                  }}
                />
              </ContextMenu.Item>
              <ContextMenu.Item
                key='delete_session'
                onSelect={() => {
                  // Handle delete action
                  Alert.alert(
                    'Delete Session',
                    'Are you sure you want to delete this session?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Delete',
                        onPress: () => {
                          // Handle delete
                          Alert.alert(
                            'Delete',
                            'Delete functionality to be implemented'
                          );
                        },
                      },
                    ]
                  );
                }}
              >
                <ContextMenu.ItemTitle>Delete Session</ContextMenu.ItemTitle>
                <ContextMenu.ItemIcon
                  ios={{
                    name: 'trash.circle',
                    pointSize: 18,
                  }}
                />
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
        </View>

        {/* Patient Info */}
        <View style={styles.patientInfoContainer}>
          <FontAwesome5
            name='user'
            size={20}
            color={Colors.primary}
            style={styles.infoIcon}
          />
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>
              {gaitSession.patient.firstName} {gaitSession.patient.lastName}
            </Text>
            <Text style={styles.sessionDate}>
              {gaitSession.sessionDate
                ? new Date(gaitSession.sessionDate).toLocaleDateString()
                : 'No date recorded'}
            </Text>
          </View>
        </View>

        {/* Videos Section */}
        <View style={styles.videosContainer}>
          <Text style={styles.sectionTitle}>Videos</Text>

          {/* Original Video */}
          <View style={styles.videoCard}>
            <Text style={styles.videoTitle}>Original Video</Text>
            {isOriginalPlaying ? (
              <Video
                ref={originalVideoRef}
                source={{ uri: gaitSession.videoUrl }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                shouldPlay
                onPlaybackStatusUpdate={(status) => {
                  if (status.isLoaded && status.didJustFinish) {
                    setIsOriginalPlaying(false);
                  }
                }}
              />
            ) : (
              <TouchableOpacity
                style={styles.videoThumbnail}
                activeOpacity={0.7}
                onPress={() => setIsOriginalPlaying(true)}
              >
                <View style={styles.playButtonContainer}>
                  <FontAwesome5 name='play' size={30} color='#fff' />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Annotated Video (if available) */}
          {gaitSession.annotatedVideoUrl && (
            <View style={styles.videoCard}>
              <Text style={styles.videoTitle}>Annotated Video</Text>
              {isAnnotatedPlaying ? (
                <Video
                  ref={annotatedVideoRef}
                  source={{ uri: gaitSession.annotatedVideoUrl }}
                  style={styles.video}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  shouldPlay
                  onPlaybackStatusUpdate={(status) => {
                    if (status.isLoaded && status.didJustFinish) {
                      setIsAnnotatedPlaying(false);
                    }
                  }}
                />
              ) : (
                <TouchableOpacity
                  style={styles.videoThumbnail}
                  activeOpacity={0.7}
                  onPress={() => setIsAnnotatedPlaying(true)}
                >
                  <View style={styles.playButtonContainer}>
                    <FontAwesome5 name='play' size={30} color='#fff' />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Description */}
        {gaitSession.description && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.infoText}>
              {expandedDescription
                ? gaitSession.description
                : truncateText(gaitSession.description)}
            </Text>
            {gaitSession.description.length > 150 && (
              <TouchableOpacity
                onPress={() => setExpandedDescription(!expandedDescription)}
                style={styles.readMoreButton}
              >
                <Text style={styles.readMoreText}>
                  {expandedDescription ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Notes */}
        {gaitSession.notes && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.infoText}>
              {expandedNotes
                ? gaitSession.notes
                : truncateText(gaitSession.notes)}
            </Text>
            {gaitSession.notes.length > 150 && (
              <TouchableOpacity
                onPress={() => setExpandedNotes(!expandedNotes)}
                style={styles.readMoreButton}
              >
                <Text style={styles.readMoreText}>
                  {expandedNotes ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Analysis Button or Loading or Error */}
        {renderAnalysisButton()}
        {renderAnalysisLoading()}
        {renderAnalysisError()}

        {/* Analysis Results (only if completed) */}
        {gaitSession.analysisStatus === AnalysisStatus.Completed && (
          <>
            {/* AI Analysis */}
            {gaitSession.summarizedAiAnalysis && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Summarized AI Analysis</Text>
                <Text style={styles.infoText}>
                  {expandedAnalysis
                    ? gaitSession.summarizedAiAnalysis
                    : truncateText(gaitSession.summarizedAiAnalysis)}
                </Text>
                <View style={styles.analysisActions}>
                  {gaitSession.summarizedAiAnalysis.length > 150 && (
                    <TouchableOpacity
                      onPress={() => setExpandedAnalysis(!expandedAnalysis)}
                      style={styles.readMoreButton}
                    >
                      <Text style={styles.readMoreText}>
                        {expandedAnalysis ? 'Read Less' : 'Read More'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {gaitSession.detailedAiAnalysis && (
                    <TouchableOpacity
                      onPress={() => setShowDetailedAnalysis(true)}
                      style={styles.viewDetailedButton}
                    >
                      <Text style={styles.viewDetailedText}>
                        View Full Analysis
                      </Text>
                      <FontAwesome5
                        name='external-link-alt'
                        size={14}
                        color={Colors.primary}
                        style={styles.viewDetailedIcon}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Possible Abnormalities */}
            {gaitSession.possibleAbnormalities &&
              gaitSession.possibleAbnormalities.length > 0 && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>
                    Possible Abnormalities
                  </Text>
                  {gaitSession.possibleAbnormalities.map(
                    (recommendation, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <View style={styles.recommendationBullet}>
                          <Text style={styles.bulletText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.recommendationText}>
                          {recommendation}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}

            {/* Recommendations */}
            {gaitSession.recommendations &&
              gaitSession.recommendations.length > 0 && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Recommendations</Text>
                  {gaitSession.recommendations.map((recommendation, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <View style={styles.recommendationBullet}>
                        <Text style={styles.bulletText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.recommendationText}>
                        {recommendation}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

            {/* Recommended Exercises */}
            {gaitSession.recommendedExercises &&
              gaitSession.recommendedExercises.length > 0 && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Recommended Exercises</Text>
                  {gaitSession.recommendedExercises.map(
                    (recommendation, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <View style={styles.recommendationBullet}>
                          <Text style={styles.bulletText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.recommendationText}>
                          {recommendation}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}

            {/* Long-Term Risks */}
            {gaitSession.longTermRisks &&
              gaitSession.longTermRisks.length > 0 && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Long-Term Risks</Text>
                  {gaitSession.longTermRisks.map((recommendation, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <View style={styles.recommendationBullet}>
                        <Text style={styles.bulletText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.recommendationText}>
                        {recommendation}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

            {/* Gait Metrics Table */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Gait Metrics</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.indexCell]}>
                      <Text style={[styles.tableHeaderText, styles.centerText]}>
                        #
                      </Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={[styles.tableHeaderText, styles.centerText]}>
                        Stance Time Left
                      </Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={[styles.tableHeaderText, styles.centerText]}>
                        Stance Time Right
                      </Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={[styles.tableHeaderText, styles.centerText]}>
                        Swing Time Left
                      </Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={[styles.tableHeaderText, styles.centerText]}>
                        Swing Time Right
                      </Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={[styles.tableHeaderText, styles.centerText]}>
                        Step Time Left
                      </Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={[styles.tableHeaderText, styles.centerText]}>
                        Step Time Right
                      </Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={[styles.tableHeaderText, styles.centerText]}>
                        Double Support Left
                      </Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={[styles.tableHeaderText, styles.centerText]}>
                        Double Support Right
                      </Text>
                    </View>
                  </View>

                  {/* Table Rows */}
                  {gaitSession.gaitMetrics.map((metric) => (
                    <View key={metric.id} style={styles.tableRow}>
                      <View style={[styles.tableCell, styles.indexCell]}>
                        <Text style={[styles.tableCellText, styles.centerText]}>
                          {metric.measurementIndex}
                        </Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={[styles.tableCellText, styles.centerText]}>
                          {metric.stanceTimeLeft?.toFixed(2) || '-'}
                        </Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={[styles.tableCellText, styles.centerText]}>
                          {metric.stanceTimeRight?.toFixed(2) || '-'}
                        </Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={[styles.tableCellText, styles.centerText]}>
                          {metric.swingTimeLeft?.toFixed(2) || '-'}
                        </Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={[styles.tableCellText, styles.centerText]}>
                          {metric.swingTimeRight?.toFixed(2) || '-'}
                        </Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={[styles.tableCellText, styles.centerText]}>
                          {metric.stepTimeLeft?.toFixed(2) || '-'}
                        </Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={[styles.tableCellText, styles.centerText]}>
                          {metric.stepTimeRight?.toFixed(2) || '-'}
                        </Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={[styles.tableCellText, styles.centerText]}>
                          {metric.doubleSupportTimeLeft?.toFixed(2) || '-'}
                        </Text>
                      </View>
                      <View style={styles.tableCell}>
                        <Text style={[styles.tableCellText, styles.centerText]}>
                          {metric.doubleSupportTimeRight?.toFixed(2) || '-'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Graph Placeholders */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Gait Analysis Graphs</Text>
              <View>
                {/* Left Leg Graph */}
                <GaitAnalysisGraph
                  data={gaitSession.gaitPlotData}
                  type='left'
                  title='Distances, Peaks (Heel Strikes), and Minima (Toe-offs) for Left Leg'
                  isLoading={isLoading}
                  height={350}
                  xAxisLabel='Frame Number'
                  yAxisLabel='Distance'
                  showLegend={true}
                />

                {/* Right Leg Graph */}
                <GaitAnalysisGraph
                  data={gaitSession.gaitPlotData}
                  type='right'
                  title='Distances, Peaks (Heel Strikes), and Minima (Toe-offs) for Right Leg'
                  isLoading={isLoading}
                  height={350}
                  xAxisLabel='Frame Number'
                  yAxisLabel='Distance'
                  showLegend={true}
                />

                {/* Comparison Graph (Optional) */}
                <GaitAnalysisGraph
                  data={gaitSession.gaitPlotData}
                  type='comparison'
                  title='Left vs Right Leg Comparison'
                  isLoading={isLoading}
                  height={400}
                  xAxisLabel='Frame Number'
                  yAxisLabel='Distance'
                  showLegend={true}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
      {gaitSession?.detailedAiAnalysis && (
        <DetailedAnalysisSheet
          analysis={gaitSession.detailedAiAnalysis}
          isVisible={showDetailedAnalysis}
          onClose={() => setShowDetailedAnalysis(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.dark,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: Colors.destructive,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  headerContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: Colors.dark,
  },
  moreButton: {
    padding: 5,
  },
  patientInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    padding: 15,
    marginTop: 0,
  },
  infoIcon: {
    marginRight: 10,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  sessionDate: {
    fontSize: 14,
    color: Colors.dark,
    marginTop: 2,
  },
  videosContainer: {
    margin: 15,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  videoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  video: {
    width: '100%',
    height: VIDEO_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  videoThumbnail: {
    width: '100%',
    height: VIDEO_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    padding: 15,
    marginTop: 0,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  analysisButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 15,
    margin: 15,
    marginTop: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  analysisButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisLoadingContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    padding: 20,
    marginTop: 0,
    alignItems: 'center',
  },
  analysisLoadingText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.dark,
    textAlign: 'center',
    lineHeight: 24,
  },
  analysisErrorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 10,
    margin: 15,
    padding: 20,
    marginTop: 0,
    alignItems: 'center',
  },
  analysisErrorText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.destructive,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryAnalysisButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  retryAnalysisButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  recommendationBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  bulletText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: {
    padding: 10,
    width: 120,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    justifyContent: 'center',
  },
  indexCell: {
    width: 50,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2c3e50',
  },
  tableCellText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  centerText: {
    textAlign: 'center',
  },
  graphPlaceholder: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginTop: 10,
  },
  comingSoonText: {
    fontSize: 14,
    color: Colors.dark,
    marginTop: 5,
  },
  analysisActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  viewDetailedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(66, 153, 225, 0.1)',
    borderRadius: 8,
  },
  viewDetailedText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  viewDetailedIcon: {
    marginLeft: 5,
  },
});
