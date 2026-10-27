import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TaskListConfig from './TaskListConfig';

// Mock variables to control the mocked context values
let mockTagsValue = ['work', 'personal', 'urgent', 'home'];

// Mock the tag context
vi.mock('../../../context/TagContext', () => ({
  useTagContext: () => ({
    tags: mockTagsValue
  })
}));

describe('TaskListConfig Component', () => {
  const mockTaskList = {
    id: 'test-list',
    title: 'Test List',
    filters: [
      { type: 'tag', value: 'work' }
    ]
  };

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
    // Reset the mock tags to the default value before each test
    mockTagsValue = ['work', 'personal', 'urgent', 'home'];
  });

  test('renders the task list config correctly', () => {
    render(
      <TaskListConfig 
        taskList={mockTaskList}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByTestId('task-list-config')).toBeInTheDocument();
    expect(screen.getByTestId('list-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('list-title-input').value).toBe('Test List');
    expect(screen.getByTestId('filter-list')).toBeInTheDocument();
    expect(screen.getByText('Tag: work')).toBeInTheDocument();
    expect(screen.getByTestId('available-tags')).toBeInTheDocument();
  });

  test('handles title input change', () => {
    render(
      <TaskListConfig 
        taskList={mockTaskList}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    const titleInput = screen.getByTestId('list-title-input');
    fireEvent.change(titleInput, { target: { value: 'Updated Test List' } });
    
    expect(titleInput.value).toBe('Updated Test List');
  });

  test('adds a tag filter when tag button is clicked', () => {
    render(
      <TaskListConfig 
        taskList={mockTaskList}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Click on a tag filter button
    const personalTagButton = screen.getByTestId('tag-filter-personal');
    fireEvent.click(personalTagButton);
    
    // Check that it's added to the filters list
    expect(screen.getByText('Tag: personal')).toBeInTheDocument();
  });

  test('adds a completion filter for active tasks', () => {
    render(
      <TaskListConfig 
        taskList={mockTaskList}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Click on the active tasks filter button
    const activeTasksButton = screen.getByTestId('active-tasks-filter');
    fireEvent.click(activeTasksButton);
    
    // Check that it's added to the filters list
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
  });

  test('adds a completion filter for completed tasks', () => {
    render(
      <TaskListConfig 
        taskList={mockTaskList}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Click on the completed tasks filter button
    const completedTasksButton = screen.getByTestId('completed-tasks-filter');
    fireEvent.click(completedTasksButton);
    
    // Check that it's added to the filters list
    expect(screen.getByText('Status: Completed')).toBeInTheDocument();
  });

  test('removes a filter when delete button is clicked', () => {
    render(
      <TaskListConfig 
        taskList={mockTaskList}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Click on the remove filter button for the existing 'work' tag filter
    const removeFilterButton = screen.getByTestId('remove-filter-0');
    fireEvent.click(removeFilterButton);
    
    // Check that it's removed from the filters list
    expect(screen.queryByText('Tag: work')).not.toBeInTheDocument();
    expect(screen.getByTestId('no-filters-message')).toBeInTheDocument();
  });

  test('saves the list configuration when save button is clicked', () => {
    render(
      <TaskListConfig 
        taskList={mockTaskList}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Update the title
    const titleInput = screen.getByTestId('list-title-input');
    fireEvent.change(titleInput, { target: { value: 'Updated List Title' } });
    
    // Add another tag filter
    const homeTagButton = screen.getByTestId('tag-filter-home');
    fireEvent.click(homeTagButton);
    
    // Add a completion status filter
    const activeTasksButton = screen.getByTestId('active-tasks-filter');
    fireEvent.click(activeTasksButton);
    
    // Save the configuration
    const saveButton = screen.getByTestId('save-config');
    fireEvent.click(saveButton);
    
    // Check that onSave was called with the updated configuration
    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'Updated List Title',
      filters: [
        { type: 'tag', value: 'work' },
        { type: 'tag', value: 'home' },
        { type: 'completed', value: false }
      ]
    });
  });

  test('cancels editing when cancel button is clicked', () => {
    render(
      <TaskListConfig 
        taskList={mockTaskList}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Make some changes
    const titleInput = screen.getByTestId('list-title-input');
    fireEvent.change(titleInput, { target: { value: 'Updated List Title' } });
    
    // Cancel editing
    const cancelButton = screen.getByTestId('cancel-config');
    fireEvent.click(cancelButton);
    
    // Check that onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('displays message when no tags are available', () => {
    // Set mock tags to an empty array for this test
    mockTagsValue = [];

    render(
      <TaskListConfig 
        taskList={mockTaskList}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByTestId('no-tags-available-message')).toBeInTheDocument();
    expect(screen.getByText('No tags available. Add tags to tasks first.')).toBeInTheDocument();
  });

  test('handles lists with no filters', () => {
    const listWithoutFilters = {
      id: 'no-filters-list',
      title: 'No Filters List',
      filters: []
    };

    render(
      <TaskListConfig 
        taskList={listWithoutFilters}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByTestId('no-filters-message')).toBeInTheDocument();
    expect(screen.getByText('No filters applied. This list will show all tasks.')).toBeInTheDocument();
  });
});