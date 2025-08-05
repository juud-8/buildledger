import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const SearchBar = ({ searchTerm, onSearchChange, placeholder = 'Search items...' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);

  // Mock autocomplete suggestions based on common construction terms
  const allSuggestions = [
    'concrete mix', 'rebar', 'lumber', 'electrical wire', 'pvc pipe',
    'foundation', 'framing', 'electrical', 'plumbing', 'roofing',
    'insulation', 'drywall', 'flooring', 'paint', 'hardware',
    'tools', 'equipment', 'labor', 'skilled labor', 'materials'
  ];

  // Filter suggestions based on search term
  useEffect(() => {
    if (searchTerm?.length > 0) {
      const filtered = allSuggestions?.filter(suggestion => 
        suggestion?.toLowerCase()?.includes(searchTerm?.toLowerCase()) &&
        suggestion?.toLowerCase() !== searchTerm?.toLowerCase()
      );
      setSuggestions(filtered?.slice(0, 5));
      setShowSuggestions(filtered?.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setActiveSuggestion(-1);
  }, [searchTerm]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e?.key === 'ArrowDown') {
      e?.preventDefault();
      setActiveSuggestion(prev => 
        prev < suggestions?.length - 1 ? prev + 1 : prev
      );
    } else if (e?.key === 'ArrowUp') {
      e?.preventDefault();
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
    } else if (e?.key === 'Enter') {
      e?.preventDefault();
      if (activeSuggestion >= 0 && suggestions?.[activeSuggestion]) {
        onSearchChange(suggestions?.[activeSuggestion]);
        setShowSuggestions(false);
      }
    } else if (e?.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
      inputRef?.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    inputRef?.current?.focus();
  };

  // Handle input blur with delay to allow suggestion clicks
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }, 200);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Icon
          name="Search"
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e?.target?.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm?.length > 0 && setShowSuggestions(suggestions?.length > 0)}
          onBlur={handleBlur}
          className="pl-10 pr-10 h-11 text-base"
        />
        {searchTerm && (
          <button
            onClick={() => {
              onSearchChange('');
              inputRef?.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={16} />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions?.length > 0 && (
        <div className="absolute top-full mt-1 w-full z-50 bg-card border border-border rounded-lg construction-shadow-lg max-h-48 overflow-y-auto">
          {suggestions?.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${
                index === activeSuggestion ? 'bg-muted/70' : ''
              }`}
            >
              <div className="flex items-center">
                <Icon name="Search" size={14} className="mr-3 text-muted-foreground" />
                <span className="text-foreground">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;