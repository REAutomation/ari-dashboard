/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Weather widget component
 */

import { useEffect, useState } from 'react';
import { Cloud, Droplets, Wind, Loader2 } from 'lucide-react';
import type { WeatherWidgetData } from '@/types/widget';

interface WeatherWidgetProps {
  data: WeatherWidgetData;
}

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
}

export function WeatherWidget({ data }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = data.apiKey || 'bd5e378503939ddaee76f12ad7a97608';
  const units = data.units || 'metric';

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `https://api.openweathermap.org/data/2.5/weather?zip=${data.zipCode},de&appid=${apiKey}&units=${units}&lang=de`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const weatherData = await response.json();
      setWeather(weatherData);
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError('Wetterdaten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();

    // Refresh every 10 minutes
    const interval = setInterval(() => {
      fetchWeather();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [data.zipCode, apiKey, units]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Lade Wetterdaten...</p>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <Cloud className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">{error || 'Keine Daten verfügbar'}</p>
        </div>
      </div>
    );
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const speedUnit = units === 'metric' ? 'km/h' : 'mph';
  const windSpeed = units === 'metric' ? (weather.wind.speed * 3.6).toFixed(1) : weather.wind.speed.toFixed(1);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 space-y-4">
      {/* Main weather display */}
      <div className="flex items-center space-x-4">
        <img
          src={iconUrl}
          alt={weather.weather[0].description}
          className="w-24 h-24 drop-shadow-md"
        />
        <div className="text-center">
          <div className="text-6xl font-bold tracking-tight">
            {Math.round(weather.main.temp)}{tempUnit}
          </div>
          <div className="text-lg text-muted-foreground capitalize mt-1">
            {weather.weather[0].description}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="text-xl font-medium text-muted-foreground">
        {data.location || weather.name}
      </div>

      {/* Divider */}
      <div className="w-full border-t border-border my-2" />

      {/* Details */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-4">
          <span className="text-sm text-muted-foreground">Gefühlt:</span>
          <span className="text-sm font-medium">
            {Math.round(weather.main.feels_like)}{tempUnit}
          </span>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Luftfeuchtigkeit:</span>
          </div>
          <span className="text-sm font-medium">{weather.main.humidity}%</span>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-cyan-500" />
            <span className="text-sm text-muted-foreground">Wind:</span>
          </div>
          <span className="text-sm font-medium">
            {windSpeed} {speedUnit}
          </span>
        </div>
      </div>
    </div>
  );
}
