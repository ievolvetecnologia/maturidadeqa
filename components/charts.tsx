"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface ChartData {
  name: string
  value: number
}

export function BarChart({ data }: { data: ChartData[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item.name),
        datasets: [
          {
            label: "Nível de Maturidade (%)",
            data: data.map((item) => item.value),
            backgroundColor: (context) => {
              const chart = context.chart
              const { ctx, chartArea } = chart
              if (!chartArea) {
                return
              }
              const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
              gradient.addColorStop(0, "#6910EA")
              gradient.addColorStop(1, "#EB1AD6")
              return gradient
            },
            borderWidth: 0,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => value + "%",
            },
            grid: {
              display: true,
              color: "rgba(105, 16, 234, 0.1)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}

export function RadarChart({ data }: { data: ChartData[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: data.map((item) => item.name),
        datasets: [
          {
            label: "Nível de Maturidade (%)",
            data: data.map((item) => item.value),
            backgroundColor: "rgba(235, 26, 214, 0.2)",
            borderColor: "#EB1AD6",
            borderWidth: 2,
            pointBackgroundColor: "#6910EA",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#6910EA",
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: (value) => value + "%",
              backdropColor: "transparent",
            },
            grid: {
              color: "rgba(105, 16, 234, 0.1)",
            },
            angleLines: {
              color: "rgba(105, 16, 234, 0.1)",
            },
            pointLabels: {
              font: {
                size: 11,
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}

// Adicionar o componente GaugeChart após o componente RadarChart

export function GaugeChart({ value }: { value: number }) {
  // Determine maturity level and color
  let maturityText = "Básico"
  let bgColor = "#ef4444" // Red for < 50%

  if (value >= 75) {
    maturityText = value >= 90 ? "Excelência" : "Avançado"
    bgColor = "#22c55e" // Green for >= 75%
  } else if (value >= 50) {
    maturityText = "Intermediário"
    bgColor = "#eab308" // Yellow for 50-74%
  } else if (value >= 30) {
    maturityText = "Em Desenvolvimento"
    bgColor = "#ef4444" // Red for < 50%
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="text-6xl font-bold mb-6">{value}%</div>
      <div className="text-white font-bold py-2 px-6 rounded-full text-lg" style={{ backgroundColor: bgColor }}>
        {maturityText}
      </div>
    </div>
  )
}
