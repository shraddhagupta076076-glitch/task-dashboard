import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TagManager from './TagManager';

// Mock the context hooks
const mockAddTag = vi.fn();
const mockEditTag = vi.fn();
const mockDeleteTag = vi.fn();
const mockUpdateTasksWithEditedTag = vi.fn();
const mockUpdateTasksWithDeletedTag = vi.fn();

// Mock data to control context values in tests
let mockTagsValue = ['work', 'personal', 'urgent'];

vi.mock('../../../context/TagContext', () => ({
  useTagContext: () => ({
    tags: mockTagsValue,
    addTag: mockAddTag,
    editTag: mockEditTag,
    deleteTag: mockDeleteTag
  })
}));

vi.mock('../../../context/TaskContext', () => ({
  useTaskContext: () => ({
    updateTasksWithEditedTag: mockUpdateTasksWithEditedTag,
    updateTasksWithDeletedTag: mockUpdateTasksWithDeletedTag
  })
}));

describe('TagManager Component', () => {
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    mockAddTag.mockClear();
    mockEditTag.mockClear();
    mockDeleteTag.mockClear();
    mockUpdateTasksWithEditedTag.mockClear();
    mockUpdateTasksWithDeletedTag.mockClear();
    mockOnClose.mockClear();
    // Reset the mock tags to the default value before each test
    mockTagsValue = ['work', 'personal', 'urgent'];
  });

  test('renders the tag manager correctly', () => {
    render(<TagManager onClose={mockOnClose} />);
    
    expect(screen.getByTestId('tag-manager')).toBeInTheDocument();
    expect(screen.getByTestId('new-tag-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-tag')).toBeInTheDocument();
    expect(screen.getByTestId('tag-list')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  test('handles tag input change', () => {
    render(<TagManager onClose={mockOnClose} />);
    
    const tagInput = screen.getByTestId('new-tag-input');
    fireEvent.change(tagInput, { target: { value: 'new-test-tag' } });
    
    expect(tagInput.value).toBe('new-test-tag');
  });

  test('adds a tag when add button is clicked', () => {
    render(<TagManager onClose={mockOnClose} />);
    
    const tagInput = screen.getByTestId('new-tag-input');
    fireEvent.change(tagInput, { target: { value: 'new-test-tag' } });
    
    const addButton = screen.getByTestId('add-tag');
    fireEvent.click(addButton);
    
    expect(mockAddTag).toHaveBeenCalledWith('new-test-tag');
    expect(tagInput.value).toBe('');
  });

  test('starts editing a tag when edit button is clicked', () => {
    render(<TagManager onClose={mockOnClose} />);
    
    const editButton = screen.getByTestId('edit-tag-work');
    fireEvent.click(editButton);
    
    expect(screen.getByTestId('edit-tag-input')).toBeInTheDocument();
    expect(screen.getByTestId('save-tag-edit')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-tag-edit')).toBeInTheDocument();
  });

  test('updates edited tag when save button is clicked', () => {
    render(<TagManager onClose={mockOnClose} />);
    
    // Start editing
    const editButton = screen.getByTestId('edit-tag-work');
    fireEvent.click(editButton);
    
    // Change the tag name
    const editInput = screen.getByTestId('edit-tag-input');
    fireEvent.change(editInput, { target: { value: 'work-edited' } });
    
    // Save changes
    const saveButton = screen.getByTestId('save-tag-edit');
    fireEvent.click(saveButton);
    
    expect(mockEditTag).toHaveBeenCalledWith('work', 'work-edited');
    expect(mockUpdateTasksWithEditedTag).toHaveBeenCalledWith('work', 'work-edited');
  });

  test('cancels editing when cancel button is clicked', () => {
    render(<TagManager onClose={mockOnClose} />);
    
    // Start editing
    const editButton = screen.getByTestId('edit-tag-work');
    fireEvent.click(editButton);
    
    // Cancel editing
    const cancelButton = screen.getByTestId('cancel-tag-edit');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByTestId('edit-tag-input')).not.toBeInTheDocument();
    expect(mockEditTag).not.toHaveBeenCalled();
  });

  test('deletes a tag when delete button is clicked', () => {
    render(<TagManager onClose={mockOnClose} />);
    
    const deleteButton = screen.getByTestId('delete-tag-personal');
    fireEvent.click(deleteButton);
    
    expect(mockDeleteTag).toHaveBeenCalledWith('personal');
    expect(mockUpdateTasksWithDeletedTag).toHaveBeenCalledWith('personal');
  });

  test('closes the tag manager when close button is clicked', () => {
    render(<TagManager onClose={mockOnClose} />);
    
    const closeButton = screen.getByTestId('close-tag-manager');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('renders no tags message when there are no tags', () => {
    // Set mock tags to an empty array for this test
    mockTagsValue = [];

    render(<TagManager onClose={mockOnClose} />);
    
    expect(screen.getByTestId('no-tags-message')).toBeInTheDocument();
    expect(screen.getByText('No tags yet')).toBeInTheDocument();
  });

  test('does not submit when empty tag name is provided', () => {
    render(<TagManager onClose={mockOnClose} />);
    
    const addButton = screen.getByTestId('add-tag');
    fireEvent.click(addButton);
    
    expect(mockAddTag).not.toHaveBeenCalled();
  });

  test('does not save edit when empty tag name is provided', () => {
    render(<TagManager onClose={mockOnClose} />);
    
    // Start editing
    const editButton = screen.getByTestId('edit-tag-urgent');
    fireEvent.click(editButton);
    
    // Change to empty string
    const editInput = screen.getByTestId('edit-tag-input');
    fireEvent.change(editInput, { target: { value: '' } });
    
    // Try to save
    const saveButton = screen.getByTestId('save-tag-edit');
    fireEvent.click(saveButton);
    
    expect(mockEditTag).not.toHaveBeenCalled();
    expect(mockUpdateTasksWithEditedTag).not.toHaveBeenCalled();
  });
});