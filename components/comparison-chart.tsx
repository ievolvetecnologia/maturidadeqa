"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface ComparisonChartProps {
  data: {
    name: string
    baseValue: number
    compareValue: number
  }[]
}

export function ComparisonChart({ data }: ComparisonChartProps) {
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
            label: "Avaliação Anterior",
            data: data.map((item) => item.baseValue),
            backgroundColor: "rgba(105, 16, 234, 0.6)",
            borderWidth: 0,
            borderRadius: 6,
          },
          {
            label: "Avaliação Atual",
            data: data.map((item) => item.compareValue),
            backgroundColor: "rgba(235, 26, 214, 0.6)",
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
            display: true,
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const datasetLabel = context.dataset.label || ""
                const value = context.parsed.y
                return `${datasetLabel}: ${value}%`
              },
              afterBody: (context) => {
                const dataIndex = context[0].dataIndex
                const baseValue = data[dataIndex].baseValue
                const compareValue = data[dataIndex].compareValue
                const difference = compareValue - baseValue
                const sign = difference > 0 ? "+" : ""
                return [`Diferença: ${sign}${difference}%`]
              },
            },
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
