import React, { createContext, useState, useContext } from 'react';
import { DataHydrationService } from '../common/utils/DataHydrationService';

// Create the list context
const ListContext = createContext();

// Custom hook for using list context
export const useListContext = () => useContext(ListContext);

// List provider component
export const ListProvider = ({ children }) => {
  const [taskLists, setTaskLists] = useState(() => {
    // Initialize with hydrated data if should hydrate
    return DataHydrationService.shouldHydrate() 
      ? DataHydrationService.getInitialTaskLists() 
      : [{ id: 'default', title: 'All Tasks', filters: [] }];
  });

  const addTaskList = () => {
    const newList = {
      id: `list-${Date.now()}`,
      title: 'New List',
      filters: []
    };
    setTaskLists([...taskLists, newList]);
    return newList;
  };

  const updateTaskList = (id, updates) => {
    setTaskLists(
      taskLists.map(list => 
        list.id === id ? { ...list, ...updates } : list
      )
    );
  };

  const deleteTaskList = (id) => {
    // Don't allow deleting the default list
    if (id === 'default') return;
    setTaskLists(taskLists.filter(list => list.id !== id));
  };

  // Filter tasks according to the task list's filter configuration
  const getFilteredTasks = (filterConfig, tasks) => {
    if (!filterConfig || filterConfig.length === 0) {
      return tasks;
    }
    
    return tasks.filter(task => {
      // ALL filters must match (AND logic)
      return filterConfig.every(filter => {
        if (filter.type === 'tag') {
          return task.tags && task.tags.includes(filter.value);
        }
        if (filter.type === 'completed') {
          return task.isCompleted === filter.value;
        }
        return true;
      });
    });
  };

  return (
    <ListContext.Provider
      value={{
        taskLists,
        addTaskList,
        updateTaskList,
        deleteTaskList,
        getFilteredTasks
      }}
    >
      {children}
    </ListContext.Provider>
  );
};