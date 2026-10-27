import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTaskContext } from './TaskContext';
import { DataHydrationService } from '../common/utils/DataHydrationService';

// Create the tag context
const TagContext = createContext();

// Custom hook for using tag context
export const useTagContext = () => useContext(TagContext);

// Tag provider component
export const TagProvider = ({ children }) => {
  const [tags, setTags] = useState(() => {
    // Initialize with hydrated data if should hydrate
    return DataHydrationService.shouldHydrate() 
      ? DataHydrationService.getInitialTags() 
      : [];
  });
  const { tasks } = useTaskContext();

  // Extract and collect all unique tags from tasks when tasks change
  useEffect(() => {
    const uniqueTags = new Set();
    
    // Collect all tags from all tasks
    tasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => uniqueTags.add(tag));
      }
    });
    
    // Add these to our existing tags (without duplicates)
    const updatedTags = Array.from(uniqueTags);
    setTags(prevTags => {
      const allTags = new Set([...prevTags, ...updatedTags]);
      return Array.from(allTags);
    });
  }, [tasks]);

  const addTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const editTag = (oldTag, newTag) => {
    // Update the tag in our tags list
    setTags(tags.map(tag => tag === oldTag ? newTag : tag));
    
    // The task updates will be handled inside the TaskContext
  };

  const deleteTag = (tagToDelete) => {
    // Remove the tag from our tags list
    setTags(tags.filter(tag => tag !== tagToDelete));
    
    // The task updates will be handled inside the TaskContext
  };

  const handleManageTags = (operation, oldTag, newTag = null) => {
    switch (operation) {
      case 'add':
        addTag(oldTag);
        break;
        
      case 'edit':
        editTag(oldTag, newTag);
        break;
        
      case 'delete':
        deleteTag(oldTag);
        break;
        
      default:
        break;
    }
  };

  return (
    <TagContext.Provider
      value={{
        tags,
        addTag,
        editTag,
        deleteTag,
        handleManageTags
      }}
    >
      {children}
    </TagContext.Provider>
  );
};