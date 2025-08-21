import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const DataAnalysisPanel = () => {
  const [dataset, setDataset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [primaryMetric, setPrimaryMetric] = useState("score");
  const [secondaryMetric, setSecondaryMetric] = useState("gdp");
  const [insights, setInsights] = useState({});
  const [chartType, setChartType] = useState("line");
  const [currentDataset, setCurrentDataset] = useState("world-happiness");

  const trendChartRef = useRef(null);
  const distributionChartRef = useRef(null);
  const correlationChartRef = useRef(null);

  // Enhanced mock datasets with more variety
  const MOCK_DATASETS = {
    "world-happiness": {
      name: "World Happiness Report",
      data: [
        { country: "Finland", score: 7.8, gdp: 1.4, social: 2.0, life: 72 },
        { country: "Denmark", score: 7.6, gdp: 1.3, social: 1.9, life: 72 },
        { country: "Switzerland", score: 7.5, gdp: 1.5, social: 1.8, life: 74 },
        { country: "Iceland", score: 7.5, gdp: 1.4, social: 2.0, life: 73 },
        { country: "Netherlands", score: 7.4, gdp: 1.4, social: 1.8, life: 72 },
      ],
      metrics: ["score", "gdp", "social", "life"],
      dimensions: ["country"],
      metricLabels: {
        score: "Happiness Score",
        gdp: "GDP per Capita",
        social: "Social Support",
        life: "Life Expectancy",
      },
    },
    "covid-19": {
      name: "COVID-19 Statistics",
      data: [
        { date: "2023-01-01", cases: 1500, deaths: 20, recovered: 1200 },
        { date: "2023-01-02", cases: 1700, deaths: 25, recovered: 1300 },
        { date: "2023-01-03", cases: 2000, deaths: 30, recovered: 1400 },
        { date: "2023-01-04", cases: 2200, deaths: 35, recovered: 1500 },
        { date: "2023-01-05", cases: 2500, deaths: 40, recovered: 1600 },
      ],
      metrics: ["cases", "deaths", "recovered"],
      dimensions: ["date"],
      metricLabels: {
        cases: "Daily Cases",
        deaths: "Daily Deaths",
        recovered: "Recovered Patients",
      },
    },
    "stock-market": {
      name: "Stock Market Data",
      data: [
        { symbol: "AAPL", price: 182.01, change: 1.2, volume: 5000000 },
        { symbol: "MSFT", price: 331.62, change: 0.8, volume: 3500000 },
        { symbol: "GOOGL", price: 138.21, change: -0.3, volume: 2500000 },
        { symbol: "AMZN", price: 145.18, change: 2.1, volume: 4000000 },
        { symbol: "META", price: 341.99, change: 1.5, volume: 3000000 },
      ],
      metrics: ["price", "change", "volume"],
      dimensions: ["symbol"],
      metricLabels: {
        price: "Stock Price ($)",
        change: "Price Change (%)",
        volume: "Trading Volume",
      },
    },
    "climate-data": {
      name: "Climate Data",
      data: [
        { year: 2010, temperature: 14.5, co2: 390, sea_level: 30 },
        { year: 2015, temperature: 14.8, co2: 405, sea_level: 45 },
        { year: 2020, temperature: 15.1, co2: 420, sea_level: 60 },
        { year: 2025, temperature: 15.5, co2: 440, sea_level: 75 },
        { year: 2030, temperature: 15.9, co2: 460, sea_level: 90 },
      ],
      metrics: ["temperature", "co2", "sea_level"],
      dimensions: ["year"],
      metricLabels: {
        temperature: "Temperature (°C)",
        co2: "CO2 (ppm)",
        sea_level: "Sea Level Rise (mm)",
      },
    },
  };

  // Calculate insights with useCallback for better performance
  const calculateInsights = useCallback(() => {
    if (dataset.length === 0) return;

    // Check if metrics exist in current dataset
    const metrics = MOCK_DATASETS[currentDataset]?.metrics || [];
    if (
      !metrics.includes(primaryMetric) ||
      !metrics.includes(secondaryMetric)
    ) {
      return;
    }

    // Extract values for calculations
    const values = dataset
      .map((d) => d[primaryMetric])
      .filter((v) => typeof v === "number");
    const secondaryValues = dataset
      .map((d) => d[secondaryMetric])
      .filter((v) => typeof v === "number");

    if (values.length === 0) return;

    // Basic statistics
    const sum = values.reduce((a, b) => a + b, 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const mean = sum / values.length;

    // Standard deviation
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Outliers (using IQR method)
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = values.filter((v) => v < lowerBound || v > upperBound);

    // Correlation
    const correlation = calculateCorrelation(values, secondaryValues);

    // Trends (linear regression slope)
    const slope = calculateSlope(values);

    setInsights({
      mean: mean.toFixed(2),
      min,
      max,
      stdDev: stdDev.toFixed(2),
      outlierCount: outliers.length,
      correlation: correlation.toFixed(2),
      trendDirection: slope > 0 ? "upward" : slope < 0 ? "downward" : "stable",
      trendStrength: Math.abs(slope).toFixed(2),
    });
  }, [dataset, primaryMetric, secondaryMetric, currentDataset]);

  // Simulate fetching data with a delay
  const fetchData = (datasetKey) => {
    setLoading(true);

    setTimeout(() => {
      try {
        const datasetObj = MOCK_DATASETS[datasetKey];
        setDataset(datasetObj.data);
        setError("");

        // Reset metrics only if they're not valid for new dataset
        if (!datasetObj.metrics.includes(primaryMetric)) {
          setPrimaryMetric(datasetObj.metrics[0]);
        }
        if (!datasetObj.metrics.includes(secondaryMetric)) {
          setSecondaryMetric(datasetObj.metrics[1] || datasetObj.metrics[0]);
        }
      } catch (err) {
        setError("Failed to load dataset");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  // Handle dataset change
  const handleDatasetChange = (e) => {
    const newDataset = e.target.value;
    setCurrentDataset(newDataset);
    fetchData(newDataset);
  };

  // Helper function: Pearson correlation
  const calculateCorrelation = (x, y) => {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, v, i) => a + v * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Helper function: Linear regression slope
  const calculateSlope = (y) => {
    if (y.length < 2) return 0;

    const x = Array.from({ length: y.length }, (_, i) => i);
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, v, i) => a + v * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  };

  // Recalculate insights when dataset or metrics change
  useEffect(() => {
    calculateInsights();
  }, [dataset, primaryMetric, secondaryMetric, calculateInsights]);

  // Render charts
  useEffect(() => {
    if (dataset.length === 0) return;

    // Destroy existing charts
    [trendChartRef, distributionChartRef, correlationChartRef].forEach(
      (ref) => {
        if (ref.current && ref.current.chart) {
          ref.current.chart.destroy();
        }
      }
    );

    // Get dimension key for labels
    const dimensionKey = MOCK_DATASETS[currentDataset].dimensions[0];

    // Trend chart (Line/Bar)
    const trendCtx = trendChartRef.current?.getContext("2d");
    if (trendCtx) {
      const trendChart = new Chart(trendCtx, {
        type: chartType,
        data: {
          labels: dataset.map((d) => d[dimensionKey]),
          datasets: [
            {
              label:
                MOCK_DATASETS[currentDataset].metricLabels[primaryMetric] ||
                primaryMetric,
              data: dataset.map((d) => d[primaryMetric]),
              borderColor: "#3b82f6",
              backgroundColor:
                chartType === "bar" ? "#3b82f680" : "transparent",
              borderWidth: 2,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            title: {
              display: true,
              text: `${
                MOCK_DATASETS[currentDataset].metricLabels[primaryMetric] ||
                primaryMetric
              } Trend`,
            },
          },
          scales: {
            x: {
              title: { display: true, text: dimensionKey },
            },
            y: {
              beginAtZero: false,
              title: { display: true, text: "Value" },
            },
          },
        },
      });
      trendChartRef.current.chart = trendChart;
    }

    // Distribution chart (Histogram)
    const distCtx = distributionChartRef.current?.getContext("2d");
    if (distCtx) {
      const distributionChart = new Chart(distCtx, {
        type: "bar",
        data: {
          labels: createHistogramBins(dataset.map((d) => d[primaryMetric])),
          datasets: [
            {
              label: "Frequency",
              backgroundColor: "#10b98180",
              borderColor: "#10b981",
              borderWidth: 1,
              data: createHistogramData(dataset.map((d) => d[primaryMetric])),
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            title: {
              display: true,
              text: `${
                MOCK_DATASETS[currentDataset].metricLabels[primaryMetric] ||
                primaryMetric
              } Distribution`,
            },
          },
        },
      });
      distributionChartRef.current.chart = distributionChart;
    }

    // Correlation chart (Scatter)
    const corrCtx = correlationChartRef.current?.getContext("2d");
    if (corrCtx) {
      const correlationChart = new Chart(corrCtx, {
        type: "scatter",
        data: {
          datasets: [
            {
              label: "Data Points",
              data: dataset.map((d) => ({
                x: d[primaryMetric],
                y: d[secondaryMetric],
              })),
              backgroundColor: "#8b5cf6",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            title: {
              display: true,
              text: `${
                MOCK_DATASETS[currentDataset].metricLabels[primaryMetric] ||
                primaryMetric
              } vs ${
                MOCK_DATASETS[currentDataset].metricLabels[secondaryMetric] ||
                secondaryMetric
              }`,
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  return `${primaryMetric}: ${ctx.parsed.x}, ${secondaryMetric}: ${ctx.parsed.y}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text:
                  MOCK_DATASETS[currentDataset].metricLabels[primaryMetric] ||
                  primaryMetric,
              },
            },
            y: {
              title: {
                display: true,
                text:
                  MOCK_DATASETS[currentDataset].metricLabels[secondaryMetric] ||
                  secondaryMetric,
              },
            },
          },
        },
      });
      correlationChartRef.current.chart = correlationChart;
    }

    return () => {
      [trendChartRef, distributionChartRef, correlationChartRef].forEach(
        (ref) => {
          if (ref.current?.chart) {
            ref.current.chart.destroy();
          }
        }
      );
    };
  }, [dataset, primaryMetric, secondaryMetric, chartType, currentDataset]);

  // Helper: Create histogram bins
  const createHistogramBins = (values) => {
    const numericValues = values.filter((v) => typeof v === "number");
    if (numericValues.length === 0) return [];

    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const binCount = 10;
    const binSize = (max - min) / binCount;

    return Array.from({ length: binCount }, (_, i) => {
      const start = min + i * binSize;
      const end = start + binSize;
      return `${start.toFixed(0)}-${end.toFixed(0)}`;
    });
  };

  // Helper: Create histogram data
  const createHistogramData = (values) => {
    const numericValues = values.filter((v) => typeof v === "number");
    if (numericValues.length === 0) return [];

    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const binCount = 10;
    const binSize = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    numericValues.forEach((value) => {
      const binIndex = Math.min(
        Math.floor((value - min) / binSize),
        binCount - 1
      );
      bins[binIndex]++;
    });

    return bins;
  };

  // Initialize
  useEffect(() => {
    fetchData(currentDataset);
  }, []);

  return (
    <div className="analysis-panel">
      <div className="controls">
        <div className="control-group">
          <label>Dataset:</label>
          <select value={currentDataset} onChange={handleDatasetChange}>
            {Object.entries(MOCK_DATASETS).map(([key, dataset]) => (
              <option key={key} value={key}>
                {dataset.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Primary Metric:</label>
          <select
            value={primaryMetric}
            onChange={(e) => setPrimaryMetric(e.target.value)}
          >
            {MOCK_DATASETS[currentDataset]?.metrics.map((metric) => (
              <option key={metric} value={metric}>
                {MOCK_DATASETS[currentDataset].metricLabels[metric] || metric}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Secondary Metric:</label>
          <select
            value={secondaryMetric}
            onChange={(e) => setSecondaryMetric(e.target.value)}
          >
            {MOCK_DATASETS[currentDataset]?.metrics.map((metric) => (
              <option key={metric} value={metric}>
                {MOCK_DATASETS[currentDataset].metricLabels[metric] || metric}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Chart Type:</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="scatter">Scatter Plot</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading dataset...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="insights">
            <div className="insight-card">
              <div className="insight-value">{insights.mean || "N/A"}</div>
              <div className="insight-label">Average</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">
                {insights.min !== undefined
                  ? `${insights.min} - ${insights.max}`
                  : "N/A"}
              </div>
              <div className="insight-label">Range</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">
                {insights.outlierCount || "0"}
              </div>
              <div className="insight-label">Outliers</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">
                {insights.correlation || "N/A"}
              </div>
              <div className="insight-label">Correlation</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">
                {insights.trendDirection || "N/A"} (
                {insights.trendStrength || "0"})
              </div>
              <div className="insight-label">Trend</div>
            </div>
          </div>

          <div className="chart-container">
            <canvas ref={trendChartRef}></canvas>
          </div>

          <div className="chart-row">
            <div className="chart-container">
              <canvas ref={distributionChartRef}></canvas>
            </div>
            <div className="chart-container">
              <canvas ref={correlationChartRef}></canvas>
            </div>
          </div>

          <div className="data-preview">
            <h4>Data Preview ({dataset.length} records):</h4>
            <div className="preview-container">
              <table>
                <thead>
                  <tr>
                    {Object.keys(dataset[0] || {}).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>
                          {typeof val === "number" ? val.toFixed(2) : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DataAnalysisPanel;
