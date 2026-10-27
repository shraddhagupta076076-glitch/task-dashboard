import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import TaskList from './TaskList';

// Mock the TaskItem component to simplify testing
vi.mock('./TaskItem', () => {
  return {
    default: function MockTaskItem({ task }) {
      return <div data-testid={`mocked-task-${task.id}`}>{task.text}</div>;
    }
  };
});

describe('TaskList Component', () => {
  const mockTasks = [
    { id: 1, text: 'Test Task 1', isCompleted: false },
    { id: 2, text: 'Test Task 2', isCompleted: true },
  ];

  test('renders a list of tasks', () => {
    render(<TaskList tasks={mockTasks} />);
    
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-task-1')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-task-2')).toBeInTheDocument();
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  test('renders empty message when no tasks are provided', () => {
    render(<TaskList tasks={[]} />);
    
    expect(screen.getByTestId('empty-task-message')).toBeInTheDocument();
    expect(screen.getByText('All tasks are complete!')).toBeInTheDocument();
  });

  test('renders each task with the proper animation container', () => {
    render(<TaskList tasks={mockTasks} />);
    
    const taskContainers = screen.getAllByTestId(/task-item-container/);
    expect(taskContainers).toHaveLength(2);
    expect(taskContainers[0]).toHaveAttribute('data-testid', `task-item-container-${mockTasks[0].id}`);
    expect(taskContainers[1]).toHaveAttribute('data-testid', `task-item-container-${mockTasks[1].id}`);
  });
});