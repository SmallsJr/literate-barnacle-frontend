import React, { useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const VisualizationPanel = () => {
  const responseTimeRef = useRef(null);
  const tokensRef = useRef(null);
  const accuracyRef = useRef(null);

  // Create refs for chart instances
  const responseTimeChart = useRef(null);
  const tokensChart = useRef(null);
  const accuracyChart = useRef(null);

  useEffect(() => {
    // Destroy existing charts before creating new ones
    if (responseTimeChart.current) {
      responseTimeChart.current.destroy();
    }
    if (tokensChart.current) {
      tokensChart.current.destroy();
    }
    if (accuracyChart.current) {
      accuracyChart.current.destroy();
    }

    // Create new charts
    responseTimeChart.current = new Chart(responseTimeRef.current, {
      type: "bar",
      data: {
        labels: ["Req 1", "Req 2", "Req 3", "Req 4", "Req 5"],
        datasets: [
          {
            label: "Response Time (ms)",
            data: [420, 380, 410, 395, 430],
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Milliseconds",
            },
          },
        },
      },
    });

    tokensChart.current = new Chart(tokensRef.current, {
      type: "line",
      data: {
        labels: ["Req 1", "Req 2", "Req 3", "Req 4", "Req 5"],
        datasets: [
          {
            label: "Tokens Used",
            data: [1200, 1150, 1250, 1180, 1220],
            fill: false,
            backgroundColor: "rgba(255, 99, 132, 0.7)",
            borderColor: "rgba(255, 99, 132, 1)",
            tension: 0.1,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: "Tokens",
            },
          },
        },
      },
    });

    accuracyChart.current = new Chart(accuracyRef.current, {
      type: "doughnut",
      data: {
        labels: ["Correct", "Incorrect", "Partial"],
        datasets: [
          {
            data: [92, 5, 3],
            backgroundColor: [
              "rgba(75, 192, 192, 0.7)",
              "rgba(255, 99, 132, 0.7)",
              "rgba(255, 206, 86, 0.7)",
            ],
            borderColor: [
              "rgba(75, 192, 192, 1)",
              "rgba(255, 99, 132, 1)",
              "rgba(255, 206, 86, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });

    // Cleanup function to destroy charts on unmount
    return () => {
      if (responseTimeChart.current) {
        responseTimeChart.current.destroy();
      }
      if (tokensChart.current) {
        tokensChart.current.destroy();
      }
      if (accuracyChart.current) {
        accuracyChart.current.destroy();
      }
    };
  }, []);

  return (
    <div className="visualization-panel">
      <div className="metric-card">
        <div className="metric-header">
          <div className="metric-label">Response Time</div>
          <div className="metric-value">420ms</div>
        </div>
        <div className="chart-container">
          <canvas ref={responseTimeRef}></canvas>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <div className="metric-label">Tokens Used</div>
          <div className="metric-value">1.2K</div>
        </div>
        <div className="chart-container">
          <canvas ref={tokensRef}></canvas>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <div className="metric-label">Accuracy</div>
          <div className="metric-value">92%</div>
        </div>
        <div className="chart-container">
          <canvas ref={accuracyRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPanel;
