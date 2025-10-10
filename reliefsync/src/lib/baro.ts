// Mock barometric pressure sensor
// In production, this would integrate with device sensors or weather API

export interface BarometricReading {
  pressure: number; // in millibars (hPa)
  timestamp: number;
  trend: 'rising' | 'falling' | 'steady';
}

export interface BarometricSnapshot {
  hPa: number;
  label: string;
  trend: 'rising' | 'falling' | 'steady';
}

// Simulates realistic barometric pressure readings
export const getBarometricPressure = async (): Promise<BarometricReading> => {
  // Normal atmospheric pressure at sea level: 1013.25 hPa
  // Typical range: 980-1050 hPa

  // For now, return a mock reading
  // In production: use device sensors or fetch from weather API
  const basePressure = 1013.25;
  const variation = Math.random() * 40 - 20; // ±20 hPa variation
  const pressure = basePressure + variation;

  // Determine trend (simplified)
  const trendValue = Math.random();
  let trend: 'rising' | 'falling' | 'steady';
  if (trendValue > 0.6) {
    trend = 'rising';
  } else if (trendValue < 0.4) {
    trend = 'falling';
  } else {
    trend = 'steady';
  }

  return {
    pressure: Math.round(pressure * 100) / 100,
    timestamp: Date.now(),
    trend,
  };
};

// Get barometric snapshot with label
export const getBarometricSnapshot = async (): Promise<BarometricSnapshot> => {
  // Mock implementation
  // In production: fetch from weather API or device sensors
  const hPa = 1013;

  let label = 'Neutral';
  if (hPa < 1000) {
    label = 'Low';
  } else if (hPa > 1020) {
    label = 'High';
  }

  // Determine trend (mock)
  const trendValue = Math.random();
  let trend: 'rising' | 'falling' | 'steady';
  if (trendValue > 0.6) {
    trend = 'rising';
  } else if (trendValue < 0.4) {
    trend = 'falling';
  } else {
    trend = 'steady';
  }

  return { hPa, label, trend };
};

// Check if pressure change might trigger headaches
// Rapid drops in pressure (>6 hPa in 3 hours) can trigger migraines
export const isPressureChangeSuspicious = (
  current: number,
  previous: number,
  hoursElapsed: number,
): boolean => {
  const change = previous - current;
  const changePerHour = change / hoursElapsed;

  // Rapid drop: more than 2 hPa per hour
  return changePerHour > 2;
};
