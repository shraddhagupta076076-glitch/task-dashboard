import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ListAddTask from './ListAddTask';

// Mock the context hooks
const mockAddTask = vi.fn();

vi.mock('../../../context/TaskContext', () => ({
  useTaskContext: () => ({
    addTask: mockAddTask
  })
}));

describe('ListAddTask Component', () => {
  const mockOnCancel = vi.fn();
  const mockListFilters = [
    { type: 'tag', value: 'work' }
  ];
  
  beforeEach(() => {
    mockAddTask.mockClear();
    mockOnCancel.mockClear();
  });

  test('renders the form correctly', () => {
    render(<ListAddTask onCancel={mockOnCancel} listFilters={mockListFilters} />);
    
    expect(screen.getByTestId('list-add-task-form')).toBeInTheDocument();
    expect(screen.getByTestId('list-task-input')).toBeInTheDocument();
    expect(screen.getByTestId('list-cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('list-submit-button')).toBeInTheDocument();
  });

  test('handles task input change', () => {
    render(<ListAddTask onCancel={mockOnCancel} listFilters={mockListFilters} />);
    
    const taskInput = screen.getByTestId('list-task-input');
    fireEvent.change(taskInput, { target: { value: 'New Test Task' } });
    
    expect(taskInput.value).toBe('New Test Task');
  });

  test('displays auto-applied tags from list filters', () => {
    render(<ListAddTask onCancel={mockOnCancel} listFilters={mockListFilters} />);
    
    expect(screen.getByTestId('auto-applied-tags')).toBeInTheDocument();
    expect(screen.getByText(/will be tagged with/i)).toBeInTheDocument();
    expect(screen.getByText(/work/i)).toBeInTheDocument();
  });

  test('submits the form with task and tags from list filters', () => {
    render(<ListAddTask onCancel={mockOnCancel} listFilters={mockListFilters} />);
    
    // Fill in task
    const taskInput = screen.getByTestId('list-task-input');
    fireEvent.change(taskInput, { target: { value: 'Submit Test Task' } });
    
    // Submit the form
    const submitButton = screen.getByTestId('list-submit-button');
    fireEvent.click(submitButton);
    
    expect(mockAddTask).toHaveBeenCalledWith({
      text: 'Submit Test Task',
      isCompleted: false,
      tags: ['work']
    });
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('cancels the form when cancel button is clicked', () => {
    render(<ListAddTask onCancel={mockOnCancel} listFilters={mockListFilters} />);
    
    const cancelButton = screen.getByTestId('list-cancel-button');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('disables submit button when task input is empty', () => {
    render(<ListAddTask onCancel={mockOnCancel} listFilters={mockListFilters} />);
    
    const submitButton = screen.getByTestId('list-submit-button');
    expect(submitButton).toBeDisabled();
    
    const taskInput = screen.getByTestId('list-task-input');
    fireEvent.change(taskInput, { target: { value: 'Some task' } });
    
    expect(submitButton).not.toBeDisabled();
  });
});