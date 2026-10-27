import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import GlobalTaskForm from './GlobalTaskForm';

// Mock the context hooks
const mockAddTask = vi.fn();
const mockAddTag = vi.fn();

vi.mock('../../../context/TaskContext', () => ({
  useTaskContext: () => ({
    addTask: mockAddTask
  })
}));

vi.mock('../../../context/TagContext', () => ({
  useTagContext: () => ({
    tags: ['existing-tag', 'another-tag'],
    addTag: mockAddTag
  })
}));

describe('GlobalTaskForm Component', () => {
  const mockOnCancel = vi.fn();
  
  beforeEach(() => {
    mockAddTask.mockClear();
    mockAddTag.mockClear();
    mockOnCancel.mockClear();
  });

  test('renders the form correctly', () => {
    render(<GlobalTaskForm onCancel={mockOnCancel} />);
    
    expect(screen.getByTestId('global-task-form')).toBeInTheDocument();
    expect(screen.getByTestId('task-input')).toBeInTheDocument();
    expect(screen.getByTestId('tag-input')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('handles task input change', () => {
    render(<GlobalTaskForm onCancel={mockOnCancel} />);
    
    const taskInput = screen.getByTestId('task-input');
    fireEvent.change(taskInput, { target: { value: 'New Test Task' } });
    
    expect(taskInput.value).toBe('New Test Task');
  });

  test('handles tag input change', () => {
    render(<GlobalTaskForm onCancel={mockOnCancel} />);
    
    const tagInput = screen.getByTestId('tag-input');
    fireEvent.change(tagInput, { target: { value: 'new-tag' } });
    
    expect(tagInput.value).toBe('new-tag');
  });

  test('adds a tag when Enter key is pressed', () => {
    render(<GlobalTaskForm onCancel={mockOnCancel} />);
    
    const tagInput = screen.getByTestId('tag-input');
    fireEvent.change(tagInput, { target: { value: 'new-tag' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    expect(screen.getByTestId('selected-tags')).toBeInTheDocument();
    expect(screen.getByText('new-tag')).toBeInTheDocument();
    expect(tagInput.value).toBe('');
  });

  test('adds a tag when comma key is pressed', () => {
    render(<GlobalTaskForm onCancel={mockOnCancel} />);
    
    const tagInput = screen.getByTestId('tag-input');
    fireEvent.change(tagInput, { target: { value: 'another-new-tag' } });
    fireEvent.keyDown(tagInput, { key: ',' });
    
    expect(screen.getByTestId('selected-tags')).toBeInTheDocument();
    expect(screen.getByText('another-new-tag')).toBeInTheDocument();
  });

  test('removes a tag when remove button is clicked', () => {
    render(<GlobalTaskForm onCancel={mockOnCancel} />);
    
    // First add a tag
    const tagInput = screen.getByTestId('tag-input');
    fireEvent.change(tagInput, { target: { value: 'tag-to-remove' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // Then remove it
    const removeButton = screen.getByTestId('remove-tag-tag-to-remove');
    fireEvent.click(removeButton);
    
    expect(screen.queryByText('tag-to-remove')).not.toBeInTheDocument();
    expect(screen.queryByTestId('selected-tags')).not.toBeInTheDocument();
  });

  test('shows tag suggestions when typing', () => {
    render(<GlobalTaskForm onCancel={mockOnCancel} />);
    
    const tagInput = screen.getByTestId('tag-input');
    fireEvent.change(tagInput, { target: { value: 'existing' } });
    
    expect(screen.getByTestId('tag-suggestions')).toBeInTheDocument();
    expect(screen.getByTestId('tag-suggestion-existing-tag')).toBeInTheDocument();
  });

  test('adds a tag when suggestion is clicked', () => {
    render(<GlobalTaskForm onCancel={mockOnCancel} />);
    
    const tagInput = screen.getByTestId('tag-input');
    fireEvent.change(tagInput, { target: { value: 'existing' } });
    
    const suggestion = screen.getByTestId('tag-suggestion-existing-tag');
    fireEvent.click(suggestion);
    
    expect(screen.getByTestId('selected-tags')).toBeInTheDocument();
    expect(screen.getByText('existing-tag')).toBeInTheDocument();
  });

  test('submits the form with task and tags', () => {
    render(<GlobalTaskForm onCancel={mockOnCancel} />);
    
    // Fill in task
    const taskInput = screen.getByTestId('task-input');
    fireEvent.change(taskInput, { target: { value: 'Submit Test Task' } });
    
    // Add a tag
    const tagInput = screen.getByTestId('tag-input');
    fireEvent.change(tagInput, { target: { value: 'test-tag' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // Submit the form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    expect(mockAddTask).toHaveBeenCalledWith({
      title: 'Submit Test Task',
      description: "",
      isCompleted: false,
      tags: ['test-tag']
    });
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('cancels the form when cancel button is clicked', () => {
    render(<GlobalTaskForm onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('disables submit button when task input is empty', () => {
    render(<GlobalTaskForm onCancel={mockOnCancel} />);
    
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
    
    const taskInput = screen.getByTestId('task-input');
    fireEvent.change(taskInput, { target: { value: 'Some task' } });
    
    expect(submitButton).not.toBeDisabled();
  });
});