"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { useReportsStore } from "../../stores/reportsStore"
import { formatCurrency } from "../../lib/formatters"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const SalesChart = () => {
  const { salesData } = useReportsStore()

  if (!salesData || salesData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">No hay datos de ventas para mostrar</div>
    )
  }

  const data = {
    labels: salesData.map((item) => {
      const date = new Date(item.date)
      return date.toLocaleDateString("es-AR", { month: "short", day: "numeric" })
    }),
    datasets: [
      {
        label: "Ventas",
        data: salesData.map((item) => item.amount),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        callbacks: {
          label: (context) => `Ventas: ${formatCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
          callback: (value) => formatCurrency(value),
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  }

  return (
    <div className="h-80">
      <Line data={data} options={options} />
    </div>
  )
}

export default SalesChart
