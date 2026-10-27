import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TaskBoard from './TaskBoard';

// Mock dependencies
vi.mock('../../tasks/components/TaskList', () => {
  return {
    default: function MockTaskList({ tasks }) {
      return (
        <div data-testid="mocked-task-list">
          Tasks count: {tasks.length}
        </div>
      );
    }
  };
});

vi.mock('../../tags/components/TagManager', () => {
  return {
    default: function MockTagManager({ onClose }) {
      return (
        <div data-testid="mocked-tag-manager">
          <button onClick={onClose} data-testid="mock-tag-manager-close">Close</button>
        </div>
      );
    }
  };
});

vi.mock('./ListAddTask', () => {
  return {
    default: function MockListAddTask({ onCancel, listFilters }) {
      return (
        <div data-testid="mocked-list-add-task">
          <button onClick={onCancel} data-testid="mock-list-add-task-cancel">Cancel</button>
          <span>Filter count: {listFilters.length}</span>
        </div>
      );
    }
  };
});

vi.mock('./TaskListConfig', () => {
  return {
    default: function MockTaskListConfig({ taskList, onSave, onCancel }) {
      return (
        <div data-testid={`mocked-task-list-config-${taskList.id}`}>
          <button 
            onClick={() => onSave({ title: 'Updated Title', filters: [] })}
            data-testid={`mock-config-save-${taskList.id}`}
          >
            Save
          </button>
          <button 
            onClick={onCancel}
            data-testid={`mock-config-cancel-${taskList.id}`}
          >
            Cancel
          </button>
        </div>
      );
    }
  };
});

// Mock context hooks
const mockTasks = [
  { id: 1, text: 'Task 1', isCompleted: false },
  { id: 2, text: 'Task 2', isCompleted: true },
  { id: 3, text: 'Task 3', isCompleted: false }
];

const mockTaskLists = [
  { id: 'default', title: 'All Tasks', filters: [] },
  { id: 'list-123', title: 'Work Tasks', filters: [{ type: 'tag', value: 'work' }] }
];

const mockCompleteAllTasks = vi.fn();
const mockDeleteCompletedTasks = vi.fn();
const mockAddTaskList = vi.fn();
const mockUpdateTaskList = vi.fn();
const mockDeleteTaskList = vi.fn();
const mockGetFilteredTasks = vi.fn().mockImplementation((filters, tasks) => {
  // Simple implementation to return all tasks for testing
  return tasks;
});

vi.mock('../../../context/TaskContext', () => ({
  useTaskContext: () => ({
    tasks: mockTasks,
    completeAllTasks: mockCompleteAllTasks,
    deleteCompletedTasks: mockDeleteCompletedTasks
  })
}));

vi.mock('../../../context/TagContext', () => ({
  useTagContext: () => ({
    tags: ['work', 'personal', 'urgent']
  })
}));

vi.mock('../../../context/ListContext', () => ({
  useListContext: () => ({
    taskLists: mockTaskLists,
    addTaskList: mockAddTaskList,
    updateTaskList: mockUpdateTaskList,
    deleteTaskList: mockDeleteTaskList,
    getFilteredTasks: mockGetFilteredTasks
  })
}));

describe('TaskBoard Component', () => {
  beforeEach(() => {
    mockCompleteAllTasks.mockClear();
    mockDeleteCompletedTasks.mockClear();
    mockAddTaskList.mockClear();
    mockUpdateTaskList.mockClear();
    mockDeleteTaskList.mockClear();
    mockGetFilteredTasks.mockClear();
  });

  test('renders the task board correctly', () => {
    render(<TaskBoard />);
    
    expect(screen.getByTestId('task-board')).toBeInTheDocument();
    expect(screen.getByTestId('task-lists-container')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-default')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-list-123')).toBeInTheDocument();
    expect(screen.getByTestId('manage-tags-button')).toBeInTheDocument();
    expect(screen.getByTestId('add-list-button')).toBeInTheDocument();
  });

  test('adds a new list when add list button is clicked', () => {
    render(<TaskBoard />);
    
    const addListButton = screen.getByTestId('add-list-button');
    fireEvent.click(addListButton);
    
    expect(mockAddTaskList).toHaveBeenCalled();
  });

  test('shows tag manager when manage tags button is clicked', () => {
    render(<TaskBoard />);
    
    const manageTagsButton = screen.getByTestId('manage-tags-button');
    fireEvent.click(manageTagsButton);
    
    expect(screen.getByTestId('tag-manager-modal')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-tag-manager')).toBeInTheDocument();
  });

  test('closes tag manager when close button is clicked', () => {
    render(<TaskBoard />);
    
    // Open tag manager
    const manageTagsButton = screen.getByTestId('manage-tags-button');
    fireEvent.click(manageTagsButton);
    
    // Close tag manager
    const closeButton = screen.getByTestId('mock-tag-manager-close');
    fireEvent.click(closeButton);
    
    // Tag manager should be closed now
    expect(screen.queryByTestId('tag-manager-modal')).not.toBeInTheDocument();
  });

  test('shows task list config when edit button is clicked', () => {
    render(<TaskBoard />);
    
    const editListButton = screen.getByTestId('edit-list-default');
    fireEvent.click(editListButton);
    
    expect(screen.getByTestId('mocked-task-list-config-default')).toBeInTheDocument();
  });

  test('updates task list when config is saved', () => {
    render(<TaskBoard />);
    
    // Open config
    const editListButton = screen.getByTestId('edit-list-default');
    fireEvent.click(editListButton);
    
    // Save config
    const saveButton = screen.getByTestId('mock-config-save-default');
    fireEvent.click(saveButton);
    
    expect(mockUpdateTaskList).toHaveBeenCalledWith('default', { title: 'Updated Title', filters: [] });
  });

  test('cancels task list config when cancel button is clicked', () => {
    render(<TaskBoard />);
    
    // Open config
    const editListButton = screen.getByTestId('edit-list-default');
    fireEvent.click(editListButton);
    
    // Cancel config
    const cancelButton = screen.getByTestId('mock-config-cancel-default');
    fireEvent.click(cancelButton);
    
    // Config should be closed
    expect(screen.queryByTestId('mocked-task-list-config-default')).not.toBeInTheDocument();
  });

  test('shows add task form when add task button is clicked', () => {
    render(<TaskBoard />);
    
    const addTaskButton = screen.getByTestId('add-task-to-list-default');
    fireEvent.click(addTaskButton);
    
    expect(screen.getByTestId('mocked-list-add-task')).toBeInTheDocument();
  });

  test('hides add task form when cancel button is clicked', () => {
    render(<TaskBoard />);
    
    // Open add task form
    const addTaskButton = screen.getByTestId('add-task-to-list-default');
    fireEvent.click(addTaskButton);
    
    // Cancel add task form
    const cancelButton = screen.getByTestId('mock-list-add-task-cancel');
    fireEvent.click(cancelButton);
    
    // Add task form should be closed
    expect(screen.queryByTestId('mocked-list-add-task')).not.toBeInTheDocument();
  });

  test('completes all tasks in a list when complete all button is clicked', () => {
    render(<TaskBoard />);
    
    const completeAllButton = screen.getByTestId('complete-all-default');
    fireEvent.click(completeAllButton);
    
    // Should call completeAllTasks with IDs of all tasks in the list
    expect(mockCompleteAllTasks).toHaveBeenCalled();
  });

  test('clears completed tasks in a list when clear completed button is clicked', () => {
    render(<TaskBoard />);
    
    const clearCompletedButton = screen.getByTestId('clear-completed-default');
    fireEvent.click(clearCompletedButton);
    
    // Should call deleteCompletedTasks with IDs of completed tasks in the list
    expect(mockDeleteCompletedTasks).toHaveBeenCalled();
  });

  test('deletes a task list when delete button is clicked', () => {
    render(<TaskBoard />);
    
    // Cannot delete the default list, so we use the custom list
    const deleteListButton = screen.getByTestId('delete-list-list-123');
    fireEvent.click(deleteListButton);
    
    expect(mockDeleteTaskList).toHaveBeenCalledWith('list-123');
  });
});