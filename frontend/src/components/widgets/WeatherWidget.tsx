/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Weather widget using Open-Meteo (free, no API key)
 */

import { useEffect, useState } from 'react';
import { Cloud, Droplets, Wind, Loader2, Sun, CloudRain, CloudSnow, CloudFog, CloudLightning } from 'lucide-react';
import type { WeatherWidgetData } from '@/types/widget';

interface WeatherWidgetProps {
  data: WeatherWidgetData;
}

interface OpenMeteoData {
  current: {
    temperature_2m: number;
    weather_code: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
  };
}

// WMO Weather codes mapping
const weatherCodes: Record<number, { description: string; icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'fog' | 'thunder' }> = {
  0: { description: 'Klar', icon: 'sun' },
  1: { description: 'Überwiegend klar', icon: 'sun' },
  2: { description: 'Teilweise bewölkt', icon: 'cloud' },
  3: { description: 'Bewölkt', icon: 'cloud' },
  45: { description: 'Nebel', icon: 'fog' },
  48: { description: 'Nebel mit Reif', icon: 'fog' },
  51: { description: 'Leichter Nieselregen', icon: 'rain' },
  53: { description: 'Nieselregen', icon: 'rain' },
  55: { description: 'Starker Nieselregen', icon: 'rain' },
  61: { description: 'Leichter Regen', icon: 'rain' },
  63: { description: 'Regen', icon: 'rain' },
  65: { description: 'Starker Regen', icon: 'rain' },
  71: { description: 'Leichter Schneefall', icon: 'snow' },
  73: { description: 'Schneefall', icon: 'snow' },
  75: { description: 'Starker Schneefall', icon: 'snow' },
  77: { description: 'Schneegriesel', icon: 'snow' },
  80: { description: 'Leichte Regenschauer', icon: 'rain' },
  81: { description: 'Regenschauer', icon: 'rain' },
  82: { description: 'Starke Regenschauer', icon: 'rain' },
  85: { description: 'Leichte Schneeschauer', icon: 'snow' },
  86: { description: 'Schneeschauer', icon: 'snow' },
  95: { description: 'Gewitter', icon: 'thunder' },
  96: { description: 'Gewitter mit Hagel', icon: 'thunder' },
  99: { description: 'Schweres Gewitter', icon: 'thunder' },
};

// Coordinates for common locations (can be extended)
const locationCoords: Record<string, { lat: number; lon: number }> = {
  '70372': { lat: 48.8058, lon: 9.2140 }, // Stuttgart Bad Cannstatt
  '70173': { lat: 48.7758, lon: 9.1829 }, // Stuttgart Mitte
  '88471': { lat: 48.2135, lon: 9.8786 }, // Laupheim
};

export function WeatherWidget({ data }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<OpenMeteoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const units = data.units || 'metric';

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get coordinates from zipCode or use Stuttgart as default
      const coords = locationCoords[data.zipCode] || locationCoords['70372'];

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=Europe/Berlin`;
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
  }, [data.zipCode, units]);

  const getWeatherIcon = (code: number) => {
    const info = weatherCodes[code] || { description: 'Unbekannt', icon: 'cloud' };
    const iconClass = "w-16 h-16 text-primary";

    switch (info.icon) {
      case 'sun':
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case 'rain':
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      case 'snow':
        return <CloudSnow className={`${iconClass} text-slate-400`} />;
      case 'fog':
        return <CloudFog className={`${iconClass} text-slate-400`} />;
      case 'thunder':
        return <CloudLightning className={`${iconClass} text-yellow-600`} />;
      default:
        return <Cloud className={`${iconClass} text-slate-400`} />;
    }
  };

  const getWeatherDescription = (code: number) => {
    return weatherCodes[code]?.description || 'Unbekannt';
  };

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

  const temp = weather.current.temperature_2m;
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const displayTemp = units === 'metric' ? temp : (temp * 9/5) + 32;

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 space-y-4">
      {/* Main weather display */}
      <div className="flex items-center space-x-4">
        {getWeatherIcon(weather.current.weather_code)}
        <div className="text-center">
          <div className="text-6xl font-bold tracking-tight">
            {Math.round(displayTemp)}{tempUnit}
          </div>
          <div className="text-lg text-muted-foreground capitalize mt-1">
            {getWeatherDescription(weather.current.weather_code)}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="text-xl font-medium text-muted-foreground">
        {data.location || 'Stuttgart'}
      </div>

      {/* Divider */}
      <div className="w-full border-t border-border my-2" />

      {/* Details */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Luftfeuchtigkeit:</span>
          </div>
          <span className="text-sm font-medium">{weather.current.relative_humidity_2m}%</span>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-cyan-500" />
            <span className="text-sm text-muted-foreground">Wind:</span>
          </div>
          <span className="text-sm font-medium">
            {weather.current.wind_speed_10m.toFixed(1)} km/h
          </span>
        </div>
      </div>
    </div>
  );
}
