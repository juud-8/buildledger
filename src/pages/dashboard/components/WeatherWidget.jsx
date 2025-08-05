import React from 'react';
import Icon from '../../../components/AppIcon';

const WeatherWidget = () => {
  const weatherData = {
    current: {
      location: 'Current Location',
      temperature: 72,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 8,
      icon: 'Cloud'
    },
    alerts: [
      {
        id: 1,
        type: 'rain',
        message: 'Rain expected tomorrow - potential delays for outdoor work',
        severity: 'warning',
        affectedProjects: ['Downtown Office Complex', 'Riverside Apartments']
      }
    ],
    forecast: [
      { day: 'Today', high: 75, low: 62, condition: 'Partly Cloudy', icon: 'Cloud' },
      { day: 'Tomorrow', high: 68, low: 58, condition: 'Rainy', icon: 'CloudRain' },
      { day: 'Wednesday', high: 71, low: 60, condition: 'Sunny', icon: 'Sun' }
    ]
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'danger':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Weather Impact</h3>
        <Icon name="CloudSun" size={20} className="text-muted-foreground" />
      </div>
      {/* Current Weather */}
      <div className="flex items-center justify-between mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Icon name={weatherData?.current?.icon} size={32} className="text-primary" />
          <div>
            <p className="text-lg font-semibold text-foreground">{weatherData?.current?.temperature}°F</p>
            <p className="text-sm text-muted-foreground">{weatherData?.current?.condition}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Humidity: {weatherData?.current?.humidity}%</p>
          <p className="text-xs text-muted-foreground">Wind: {weatherData?.current?.windSpeed} mph</p>
        </div>
      </div>
      {/* Weather Alerts */}
      {weatherData?.alerts?.length > 0 && (
        <div className="mb-6">
          {weatherData?.alerts?.map((alert) => (
            <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start space-x-2">
                <Icon name="AlertTriangle" size={16} className="mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs mt-1 opacity-80">
                    Affected: {alert.affectedProjects?.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 3-Day Forecast */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">3-Day Forecast</h4>
        {weatherData?.forecast?.map((day, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name={day?.icon} size={20} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{day?.day}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-foreground">{day?.high}°</span>
              <span className="text-sm text-muted-foreground">{day?.low}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;