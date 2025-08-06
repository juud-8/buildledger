import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/Card';

const ClientCard = ({ 
  client, 
  isSelected,
  onSelect,
  onViewDetails, 
  onEdit,
  onDelete,
  onCreateQuote, 
  onStartProject, 
  onContactClient 
}) => {
  const getClientTypeIcon = (type) => {
    switch (type) {
      case 'residential':
        return 'Home';
      case 'commercial':
        return 'Building2';
      case 'industrial':
        return 'Factory';
      case 'government':
        return 'Building';
      default:
        return 'User';
    }
  };

  const getClientTypeColor = (type) => {
    switch (type) {
      case 'residential':
        return 'bg-blue-100 text-blue-800';
      case 'commercial':
        return 'bg-orange-100 text-orange-800';
      case 'industrial':
        return 'bg-purple-100 text-purple-800';
      case 'government':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPaymentTermsLabel = (terms) => {
    const termLabels = {
      'cod': 'COD',
      'net15': 'Net 15',
      'net30': 'Net 30',
      'net45': 'Net 45',
      'net60': 'Net 60'
    };
    return termLabels[terms] || terms;
  };

  const getFullAddress = () => {
    if (!client?.address) return null;
    const { street, city, state, zip } = client.address;
    const parts = [street, city, state, zip].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <Card className={`relative transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={getClientTypeIcon(client?.client_type)} size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">{client?.name}</CardTitle>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getClientTypeColor(client?.client_type)}`}>
                  {client?.client_type}
                </span>
                {client?.is_active ? (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    Inactive
                  </span>
                )}
                {client?.payment_terms && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {getPaymentTermsLabel(client.payment_terms)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Menu */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              iconName="MoreVertical"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                // You could implement a dropdown menu here
              }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Contact Information */}
          <div className="space-y-2">
            {client?.email && (
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Mail" size={16} className="text-muted-foreground" />
                <a 
                  href={`mailto:${client.email}`}
                  className="text-foreground hover:text-primary truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {client.email}
                </a>
              </div>
            )}
            
            {client?.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Phone" size={16} className="text-muted-foreground" />
                <a 
                  href={`tel:${client.phone}`}
                  className="text-foreground hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  {client.phone}
                </a>
              </div>
            )}
            
            {getFullAddress() && (
              <div className="flex items-start space-x-2 text-sm">
                <Icon name="MapPin" size={16} className="text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground line-clamp-2">
                  {getFullAddress()}
                </span>
              </div>
            )}

            {client?.company_name && (
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Building2" size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground truncate">
                  {client.company_name}
                </span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Client Since</span>
              <span className="font-medium text-foreground">
                {formatDate(client?.created_at)}
              </span>
            </div>
            {client?.contact_person && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Contact Person</span>
                <span className="font-medium text-foreground truncate ml-2">
                  {client.contact_person}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                iconName="FileText"
                iconPosition="left"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateQuote(client?.id);
                }}
                className="w-full"
              >
                Quote
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Briefcase"
                iconPosition="left"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartProject(client?.id);
                }}
                className="w-full"
              >
                Project
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="ghost"
                size="sm"
                iconName="Eye"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(client?.id);
                }}
                className="w-full"
                title="View Details"
              />
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(client?.id);
                  }}
                  className="w-full"
                  title="Edit Client"
                />
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Trash2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(client?.id);
                  }}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Delete Client"
                />
              )}
            </div>

            <Button
              variant="default"
              size="sm"
              iconName="MessageSquare"
              iconPosition="left"
              onClick={(e) => {
                e.stopPropagation();
                onContactClient();
              }}
              className="w-full"
            >
              Contact Client
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;