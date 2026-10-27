import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TaskItem from './TaskItem';

// Mock the context functions
const mockToggleTask = vi.fn();
const mockDeleteTask = vi.fn();

vi.mock('../../../context/TaskContext', () => ({
  useTaskContext: () => ({
    toggleTask: mockToggleTask,
    deleteTask: mockDeleteTask
  })
}));

describe('TaskItem Component', () => {
  const mockTask = {
    id: 1,
    text: 'Test Task',
    isCompleted: false,
    tags: ['test', 'important']
  };

  const mockCompletedTask = {
    id: 2,
    text: 'Completed Task',
    isCompleted: true,
    tags: ['done']
  };

  beforeEach(() => {
    mockToggleTask.mockClear();
    mockDeleteTask.mockClear();
  });

  test('renders task item correctly', () => {
    render(<TaskItem task={mockTask} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByTestId(`task-checkbox-${mockTask.id}`)).not.toBeChecked();
  });

  test('renders completed task with appropriate styling', () => {
    render(<TaskItem task={mockCompletedTask} />);
    
    const taskText = screen.getByText('Completed Task');
    expect(taskText).toBeInTheDocument();
    expect(taskText).toHaveClass('line-through');
    expect(screen.getByTestId(`task-checkbox-${mockCompletedTask.id}`)).toBeChecked();
  });

  test('calls toggleTask when checkbox is clicked', () => {
    render(<TaskItem task={mockTask} />);
    
    fireEvent.click(screen.getByTestId(`task-checkbox-${mockTask.id}`));
    expect(mockToggleTask).toHaveBeenCalledWith(mockTask.id);
  });

  test('calls toggleTask when task text is clicked', () => {
    render(<TaskItem task={mockTask} />);
    
    fireEvent.click(screen.getByText(mockTask.text));
    expect(mockToggleTask).toHaveBeenCalledWith(mockTask.id);
  });

  test('calls deleteTask when delete button is clicked', () => {
    render(<TaskItem task={mockTask} />);
    
    fireEvent.click(screen.getByTestId(`delete-task-${mockTask.id}`));
    expect(mockDeleteTask).toHaveBeenCalledWith(mockTask.id);
  });

  test('renders task without tags when no tags are provided', () => {
    const taskWithoutTags = { ...mockTask, tags: [] };
    render(<TaskItem task={taskWithoutTags} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByTestId(`task-tags-${taskWithoutTags.id}`)).not.toBeInTheDocument();
  });
});