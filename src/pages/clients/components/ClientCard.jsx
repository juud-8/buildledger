import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/Card';

const ClientCard = ({ client, onViewDetails, onCreateQuote, onStartProject, onContactClient }) => {
  const getClientTypeIcon = (type) => {
    switch (type) {
      case 'residential':
        return 'Home';
      case 'commercial':
        return 'Building2';
      default:
        return 'User';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={getClientTypeIcon(client?.type)} size={24} className="text-primary" />
            </div>
            <div>
              <CardTitle>{client?.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getClientTypeIcon(client?.type) === 'Home' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                  {client?.type}
                </span>
                {client?.isRepeat && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                    Repeat Client
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(client?.id)}
          >
            <Icon name="MoreVertical" size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Mail" size={14} />
            <span>{client?.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Phone" size={14} />
            <span>{client?.phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="MapPin" size={14} />
            <span>{client?.location}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{formatCurrency(client?.totalValue)}</div>
            <div className="text-xs text-muted-foreground">Total Project Value</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{client?.activeProjects}</div>
            <div className="text-xs text-muted-foreground">Active Projects</div>
          </div>
        </div>

        {/* Payment Status & Last Contact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Payment:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize bg-${client?.paymentHistory}/10 text-${client?.paymentHistory}`}>
              {client?.paymentHistory}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Last contact: {formatDate(client?.lastContact)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(client?.id)}
            iconName="Eye"
            iconPosition="left"
            iconSize={14}
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCreateQuote(client?.id)}
            iconName="FileText"
            iconPosition="left"
            iconSize={14}
          >
            Create Quote
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStartProject(client?.id)}
            iconName="Plus"
            iconPosition="left"
            iconSize={14}
          >
            Start Project
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onContactClient(client?.id)}
            iconName="MessageCircle"
            iconPosition="left"
            iconSize={14}
          >
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;