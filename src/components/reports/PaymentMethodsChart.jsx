"use client"

import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { useReportsStore } from "../../stores/reportsStore"
import { formatCurrency } from "../../lib/formatters"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const PaymentMethodsChart = () => {
  const { paymentMethods } = useReportsStore()

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No hay datos de métodos de pago para mostrar
      </div>
    )
  }

  const colors = [
    "rgba(34, 197, 94, 0.8)",
    "rgba(59, 130, 246, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(139, 92, 246, 0.8)",
  ]

  const data = {
    labels: paymentMethods.map((item) => item.method),
    datasets: [
      {
        label: "Monto",
        data: paymentMethods.map((item) => item.amount),
        backgroundColor: colors.slice(0, paymentMethods.length),
        borderColor: colors.slice(0, paymentMethods.length).map((color) => color.replace("0.8", "1")),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
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
          label: (context) => {
            const method = paymentMethods[context.dataIndex]
            return [
              `Monto: ${formatCurrency(context.parsed.y)}`,
              `Transacciones: ${method.transactions}`,
              `Porcentaje: ${method.percentage.toFixed(1)}%`,
            ]
          },
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
  }

  return (
    <div className="h-80">
      <Bar data={data} options={options} />
    </div>
  )
}

export default PaymentMethodsChart
