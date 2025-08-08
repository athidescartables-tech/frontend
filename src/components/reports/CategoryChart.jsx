"use client"

import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { useReportsStore } from "../../stores/reportsStore"
import { formatCurrency } from "../../lib/formatters"

ChartJS.register(ArcElement, Tooltip, Legend)

const CategoryChart = () => {
  const { categoryData } = useReportsStore()

  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">No hay datos de categorías para mostrar</div>
    )
  }

  const colors = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(139, 92, 246, 0.8)",
    "rgba(236, 72, 153, 0.8)",
    "rgba(34, 197, 94, 0.8)",
    "rgba(168, 85, 247, 0.8)",
  ]

  const data = {
    labels: categoryData.map((item) => item.category),
    datasets: [
      {
        data: categoryData.map((item) => item.amount),
        backgroundColor: colors.slice(0, categoryData.length),
        borderColor: colors.slice(0, categoryData.length).map((color) => color.replace("0.8", "1")),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = formatCurrency(context.parsed)
            const percentage = categoryData[context.dataIndex].percentage
            return `${label}: ${value} (${percentage.toFixed(1)}%)`
          },
        },
      },
    },
  }

  return (
    <div className="h-80">
      <Doughnut data={data} options={options} />
    </div>
  )
}

export default CategoryChart
