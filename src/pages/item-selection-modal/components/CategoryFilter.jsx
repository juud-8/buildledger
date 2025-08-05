import React from 'react';

import Button from '../../../components/ui/Button';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      <span className="text-sm font-medium text-foreground whitespace-nowrap mr-2">
        Categories:
      </span>
      {categories?.map(category => (
        <Button
          key={category?.id}
          variant={selectedCategory === category?.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category?.id)}
          iconName={category?.icon}
          iconPosition="left"
          className="whitespace-nowrap"
        >
          {category?.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;