"use client"

import { useEffect } from "react"
import { useCategoryStore } from "../../stores/categoryStore"
import Card from "../common/Card"
import { TagIcon, ChartBarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

const CategoryStats = () => {
  const { stats, loading, error, fetchStats } = useCategoryStore()

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const StatCard = ({ title, value, icon: Icon, color = "text-gray-600", subtitle, loading = false }) => (
    <Card>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        <div className="ml-5">
          <dl>
            <dt className="text-sm font-medium text-gray-500">{title}</dt>
            <dd className="text-2xl font-semibold text-gray-900">
              {loading ? <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div> : value || 0}
            </dd>
            {subtitle && <dd className="text-xs text-gray-500">{subtitle}</dd>}
          </dl>
        </div>
      </div>
    </Card>
  )

  if (error) {
    return (
      <Card className="p-4">
        <div className="flex items-center text-red-600">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">Error al cargar estadísticas: {error}</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Categorías"
        value={stats?.total || 0}
        icon={TagIcon}
        color="text-blue-600"
        loading={loading}
      />
      <StatCard
        title="Categorías Activas"
        value={stats?.active || 0}
        icon={ChartBarIcon}
        color="text-green-600"
        loading={loading}
      />
      <StatCard
        title="Categorías Inactivas"
        value={stats?.inactive || 0}
        icon={TagIcon}
        color="text-red-600"
        loading={loading}
      />
    </div>
  )
}

export default CategoryStats
