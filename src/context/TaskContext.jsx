import React, { createContext, useState, useContext, useEffect } from 'react';
import { DataHydrationService } from '../common/utils/DataHydrationService';

// Create the task context
const TaskContext = createContext();

// Custom hook for using task context
export const useTaskContext = () => useContext(TaskContext);

// Task provider component
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    // Initialize with hydrated data if should hydrate
    return DataHydrationService.shouldHydrate() 
      ? DataHydrationService.getInitialTasks() 
      : [];
  });
  const [stats, setStats] = useState({ total: 0, completed: 0, remaining: 0 });

  useEffect(() => {
    // Update stats whenever tasks change
    const completed = tasks.filter(task => task.isCompleted).length;
    setStats({
      total: tasks.length,
      completed,
      remaining: tasks.length - completed
    });
  }, [tasks]);

  const addTask = (task) => {
    const id = Math.floor(Math.random() * 10000) + 1;
    const newTask = { id, ...task };
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const completeAllTasks = (taskIds = null) => {
    if (taskIds) {
      // Complete specific tasks (for task lists)
      setTasks(tasks.map(task => 
        taskIds.includes(task.id) ? { ...task, isCompleted: true } : task
      ));
    } else {
      // Complete all tasks
      setTasks(tasks.map(task => ({ ...task, isCompleted: true })));
    }
  };

  const deleteCompletedTasks = (taskIds = null) => {
    if (taskIds && taskIds.length > 0) {
      // Delete specific completed tasks (for task lists)
      setTasks(tasks.filter(task => !taskIds.includes(task.id)));
    } else {
      // Delete all completed tasks
      setTasks(tasks.filter(task => !task.isCompleted));
    }
  };

  // Tag-related task operations
  const updateTasksWithEditedTag = (oldTag, newTag) => {
    setTasks(tasks.map(task => {
      if (task.tags && task.tags.includes(oldTag)) {
        const updatedTags = task.tags.map(tag => 
          tag === oldTag ? newTag : tag
        );
        return { ...task, tags: updatedTags };
      }
      return task;
    }));
  };

  const updateTasksWithDeletedTag = (tagToDelete) => {
    setTasks(tasks.map(task => {
      if (task.tags && task.tags.includes(tagToDelete)) {
        const updatedTags = task.tags.filter(tag => tag !== tagToDelete);
        return { ...task, tags: updatedTags };
      }
      return task;
    }));
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        addTask,
        toggleTask,
        deleteTask,
        completeAllTasks,
        deleteCompletedTasks,
        updateTasksWithEditedTag,
        updateTasksWithDeletedTag
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};