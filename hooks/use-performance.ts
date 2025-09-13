"use client";

import { useEffect } from "react";

// Web Vitals monitoring hook
export const useWebVitals = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && "performance" in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            const navEntry = entry as PerformanceNavigationTiming;

            // Log navigation timing
            console.log("Navigation Timing:", {
              "DNS Lookup":
                navEntry.domainLookupEnd - navEntry.domainLookupStart,
              "TCP Connection": navEntry.connectEnd - navEntry.connectStart,
              "Server Response": navEntry.responseEnd - navEntry.requestStart,
              "DOM Content Loaded":
                navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
              "Page Load Complete": navEntry.loadEventEnd - navEntry.fetchStart,
            });
          }

          if (entry.entryType === "paint") {
            console.log(`${entry.name}: ${entry.startTime}ms`);
          }
        }
      });

      observer.observe({ entryTypes: ["navigation", "paint"] });

      // Monitor Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log("LCP:", lastEntry.startTime);
      });

      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log("FID:", (entry as any).processingStart - entry.startTime);
        }
      });

      fidObserver.observe({ entryTypes: ["first-input"] });

      return () => {
        observer.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
      };
    }
  }, []);
};

// Performance timing utilities
export const logPerformanceTiming = (name: string) => {
  if (typeof window !== "undefined" && window.performance) {
    performance.mark(`${name}-start`);

    return () => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      const measure = performance.getEntriesByName(name, "measure")[0];
      if (measure) {
        console.log(`${name} took ${measure.duration.toFixed(2)}ms`);
      }
    };
  }

  return () => {};
};

// Bundle size monitoring for development
export const logBundleSize = () => {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    // Get resource timing for loaded scripts
    const scripts = performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes(".js"));

    const totalSize = scripts.reduce((sum, script) => {
      return sum + ((script as any).transferSize || 0);
    }, 0);

    console.log(
      "Estimated JS Bundle Size:",
      `${(totalSize / 1024).toFixed(2)} KB`
    );
  }
};

// Memory usage monitoring
export const useMemoryMonitoring = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && "memory" in performance) {
      const logMemoryUsage = () => {
        const memory = (performance as any).memory;
        console.log("Memory Usage:", {
          Used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
          Total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
          Limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
        });
      };

      const interval = setInterval(logMemoryUsage, 30000); // Log every 30 seconds

      return () => clearInterval(interval);
    }
  }, []);
};
