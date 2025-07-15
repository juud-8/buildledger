'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { performanceMonitor, monitorMemoryUsage, monitorNetworkPerformance } from '@/lib/performance-utils'

interface PerformanceContextType {
  recordMetric: (name: string, value: number, unit?: string) => void
  getMetrics: () => any[]
  memoryUsage: any
  networkInfo: any
}

const PerformanceContext = createContext<PerformanceContextType | null>(null)

interface PerformanceProviderProps {
  children: ReactNode
  enableLogging?: boolean
}

export function PerformanceProvider({ 
  children, 
  enableLogging = process.env.NODE_ENV === 'development' 
}: PerformanceProviderProps) {
  useEffect(() => {
    if (!enableLogging) return

    // Monitor initial page load metrics
    const recordInitialMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        performanceMonitor.recordMetric('DNS Lookup', navigation.domainLookupEnd - navigation.domainLookupStart)
        performanceMonitor.recordMetric('TCP Connection', navigation.connectEnd - navigation.connectStart)
        performanceMonitor.recordMetric('Request Time', navigation.responseStart - navigation.requestStart)
        performanceMonitor.recordMetric('Response Time', navigation.responseEnd - navigation.responseStart)
        performanceMonitor.recordMetric('DOM Parse', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)
        performanceMonitor.recordMetric('Total Load Time', navigation.loadEventEnd - navigation.navigationStart)
      }

      // Memory usage
      const memory = monitorMemoryUsage()
      if (memory) {
        performanceMonitor.recordMetric('Memory Used', memory.used, 'MB')
      }
    }

    // Record metrics after page load
    if (document.readyState === 'complete') {
      recordInitialMetrics()
    } else {
      window.addEventListener('load', recordInitialMetrics)
    }

    // Monitor memory usage periodically
    const memoryInterval = setInterval(() => {
      const memory = monitorMemoryUsage()
      if (memory) {
        performanceMonitor.recordMetric('Memory Used', memory.used, 'MB')
        
        // Warn if memory usage is high
        if (memory.used > memory.limit * 0.8) {
          console.warn(`High memory usage detected: ${memory.used}MB / ${memory.limit}MB`)
        }
      }
    }, 30000) // Every 30 seconds

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming
        
        // Track slow resources
        if (resource.duration > 1000) { // > 1 second
          console.warn(`Slow resource detected: ${resource.name} took ${resource.duration}ms`)
          performanceMonitor.recordMetric(`Slow Resource: ${resource.name}`, resource.duration)
        }

        // Track large resources
        if (resource.transferSize > 500000) { // > 500KB
          console.warn(`Large resource detected: ${resource.name} is ${Math.round(resource.transferSize / 1024)}KB`)
          performanceMonitor.recordMetric(`Large Resource: ${resource.name}`, resource.transferSize, 'bytes')
        }
      }
    })

    try {
      resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('Resource observer not supported:', error)
    }

    // Cleanup
    return () => {
      clearInterval(memoryInterval)
      resourceObserver.disconnect()
      window.removeEventListener('load', recordInitialMetrics)
    }
  }, [enableLogging])

  const contextValue: PerformanceContextType = {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    memoryUsage: monitorMemoryUsage(),
    networkInfo: monitorNetworkPerformance()
  }

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

// Development-only performance panel
export function PerformancePanel() {
  const { getMetrics, memoryUsage, networkInfo } = usePerformance()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const metrics = getMetrics()
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white text-xs p-4 rounded-lg max-w-xs z-50">
      <h3 className="font-bold mb-2">Performance Metrics</h3>
      
      {memoryUsage && (
        <div className="mb-2">
          <strong>Memory:</strong> {memoryUsage.used}MB / {memoryUsage.limit}MB
        </div>
      )}
      
      {networkInfo && (
        <div className="mb-2">
          <strong>Network:</strong> {networkInfo.effectiveType} ({networkInfo.downlink}Mbps)
        </div>
      )}
      
      <div className="max-h-32 overflow-y-auto">
        {metrics.slice(-5).map((metric, index) => (
          <div key={index} className="flex justify-between">
            <span>{metric.name}:</span>
            <span>{metric.value.toFixed(1)}{metric.unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}