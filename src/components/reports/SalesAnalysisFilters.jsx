"use client"

import { useReportsStore } from "../../stores/reportsStore"
import { CalendarIcon } from "@heroicons/react/24/outline"

const SalesAnalysisFilters = () => {
  const { dateRange, selectedPeriod, setPeriod, setDateRange } = useReportsStore()

  const periods = [
    { value: "today", label: "Hoy" },
    { value: "yesterday", label: "Ayer" },
    { value: "last7days", label: "Últimos 7 días" },
    { value: "last30days", label: "Últimos 30 días" },
    { value: "thisMonth", label: "Este mes" },
    { value: "lastMonth", label: "Mes anterior" },
    { value: "thisYear", label: "Este año" },
    { value: "custom", label: "Personalizado" },
  ]

  const handleDateChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value }
    setDateRange(newRange.start, newRange.end)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Selector de período */}
      <div className="flex items-center space-x-2">
        <CalendarIcon className="h-5 w-5 text-gray-400" />
        <select
          value={selectedPeriod}
          onChange={(e) => setPeriod(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
      </div>

      {/* Fechas personalizadas */}
      {selectedPeriod === "custom" && (
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateChange("start", e.target.value)}
            className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-gray-500">hasta</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateChange("end", e.target.value)}
            className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
    </div>
  )
}

export default SalesAnalysisFilters
