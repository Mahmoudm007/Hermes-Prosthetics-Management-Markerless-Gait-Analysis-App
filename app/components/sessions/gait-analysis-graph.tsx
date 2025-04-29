import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryLegend,
  VictoryTheme,
  VictoryContainer,
} from 'victory-native';
import type { GaitPlotData } from '@/types/session.type';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export type GraphType = 'left' | 'right' | 'comparison';

interface GaitAnalysisGraphProps {
  data: GaitPlotData[];
  type: GraphType;
  title: string;
  isLoading?: boolean;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
}

export default function GaitAnalysisGraph({
  data,
  type,
  title,
  isLoading = false,
  height = 300,
  xAxisLabel = 'Frame Number',
  yAxisLabel = 'Distance',
  showLegend = true,
}: GaitAnalysisGraphProps) {
  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={Colors.primary} />
          <Text style={styles.loadingText}>Loading graph data...</Text>
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Filter out null values and prepare data for the graph
  const prepareLineData = (
    dataArray: GaitPlotData[],
    distanceKey: 'distLeftFiltered' | 'distRightFiltered'
  ) => {
    return dataArray
      .filter((item) => item[distanceKey] !== null)
      .map((item) => ({
        x: item.frameNumber,
        y: item[distanceKey],
      }));
  };

  const preparePeakData = (
    dataArray: GaitPlotData[],
    distanceKey: 'distLeftFiltered' | 'distRightFiltered',
    isPeakKey: 'isPeakLeft' | 'isPeakRight'
  ) => {
    return dataArray
      .filter((item) => item[isPeakKey] && item[distanceKey] !== null)
      .map((item) => ({
        x: item.frameNumber,
        y: item[distanceKey],
      }));
  };

  const prepareMinimaData = (
    dataArray: GaitPlotData[],
    distanceKey: 'distLeftFiltered' | 'distRightFiltered',
    isMinimaKey: 'isMinimaLeft' | 'isMinimaRight'
  ) => {
    return dataArray
      .filter((item) => item[isMinimaKey] && item[distanceKey] !== null)
      .map((item) => ({
        x: item.frameNumber,
        y: item[distanceKey],
      }));
  };

  // Prepare data based on graph type
  let leftLineData: any[] = [];
  let leftPeakData: any[] = [];
  let leftMinimaData: any[] = [];
  let rightLineData: any[] = [];
  let rightPeakData: any[] = [];
  let rightMinimaData: any[] = [];

  if (type === 'left' || type === 'comparison') {
    leftLineData = prepareLineData(data, 'distLeftFiltered');
    leftPeakData = preparePeakData(data, 'distLeftFiltered', 'isPeakLeft');
    leftMinimaData = prepareMinimaData(
      data,
      'distLeftFiltered',
      'isMinimaLeft'
    );
  }

  if (type === 'right' || type === 'comparison') {
    rightLineData = prepareLineData(data, 'distRightFiltered');
    rightPeakData = preparePeakData(data, 'distRightFiltered', 'isPeakRight');
    rightMinimaData = prepareMinimaData(
      data,
      'distRightFiltered',
      'isMinimaRight'
    );
  }

  // Determine domain for axes
  const allYValues = [
    ...leftLineData.map((d) => d.y as number),
    ...rightLineData.map((d) => d.y as number),
  ].filter(Boolean);

  const yMin = Math.min(...allYValues) * 0.95;
  const yMax = Math.max(...allYValues) * 1.05;

  const allXValues = [
    ...leftLineData.map((d) => d.x as number),
    ...rightLineData.map((d) => d.x as number),
  ].filter(Boolean);

  const xMin = Math.min(...allXValues);
  const xMax = Math.max(...allXValues);

  // Configure legend items based on graph type
  const legendItems = [];

  if (type === 'left' || type === 'comparison') {
    legendItems.push(
      { name: 'Distances Left Leg', symbol: { fill: '#0066FF' } },
      { name: 'Peaks (Heel Strikes) Left Leg', symbol: { fill: '#FF0000' } },
      { name: 'Minima (Toe-offs) Left Leg', symbol: { fill: '#00CC00' } }
    );
  }

  if (type === 'right' || type === 'comparison') {
    legendItems.push(
      { name: 'Distances Right Leg', symbol: { fill: '#9933FF' } },
      { name: 'Peaks (Heel Strikes) Right Leg', symbol: { fill: '#FF6600' } },
      { name: 'Minima (Toe-offs) Right Leg', symbol: { fill: '#00CCCC' } }
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <VictoryChart
        theme={VictoryTheme.material}
        width={width - 40}
        height={height}
        padding={{
          top: type === 'comparison' ? 100 : 80,
          bottom: 50,
          left: 60,
          right: 50,
        }}
        domain={{ y: [yMin, yMax], x: [xMin, xMax] }}
        containerComponent={<VictoryContainer responsive={true} />}
      >
        {/* X and Y Axes */}
        <VictoryAxis
          label={xAxisLabel}
          style={{
            axisLabel: { padding: 30, fontSize: 12 },
            grid: { stroke: '#DDDDDD' },
            tickLabels: { fontSize: 10 },
          }}
        />
        <VictoryAxis
          dependentAxis
          label={yAxisLabel}
          style={{
            axisLabel: { padding: 40, fontSize: 12 },
            grid: { stroke: '#DDDDDD' },
            tickLabels: { fontSize: 10 },
          }}
        />

        {/* Left Leg Data */}
        {(type === 'left' || type === 'comparison') &&
          leftLineData.length > 0 && (
            <VictoryLine
              data={leftLineData}
              style={{ data: { stroke: '#0066FF', strokeWidth: 2 } }}
              interpolation='natural'
            />
          )}

        {(type === 'left' || type === 'comparison') &&
          leftPeakData.length > 0 && (
            <VictoryScatter
              data={leftPeakData}
              style={{ data: { fill: '#FF0000' } }}
            />
          )}

        {(type === 'left' || type === 'comparison') &&
          leftMinimaData.length > 0 && (
            <VictoryScatter
              data={leftMinimaData}
              style={{ data: { fill: '#00CC00' } }}
            />
          )}

        {/* Right Leg Data */}
        {(type === 'right' || type === 'comparison') &&
          rightLineData.length > 0 && (
            <VictoryLine
              data={rightLineData}
              style={{ data: { stroke: '#9933FF', strokeWidth: 2 } }}
              interpolation='natural'
            />
          )}

        {(type === 'right' || type === 'comparison') &&
          rightPeakData.length > 0 && (
            <VictoryScatter
              data={rightPeakData}
              style={{ data: { fill: '#FF6600' } }}
            />
          )}

        {(type === 'right' || type === 'comparison') &&
          rightMinimaData.length > 0 && (
            <VictoryScatter
              data={rightMinimaData}
              style={{ data: { fill: '#00CCCC' } }}
            />
          )}

        {/* Legend */}
        {showLegend && (
          <VictoryLegend
            x={width / 2 - 220}
            y={10}
            centerTitle
            orientation='vertical'
            itemsPerRow={type === 'comparison' ? 3 : 2}
            gutter={10}
            style={{
              labels: { fontSize: 12 },
              title: { fontSize: 12 },
            }}
            data={legendItems}
          />
        )}
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.dark,
  },
  emptyContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark,
  },
});
