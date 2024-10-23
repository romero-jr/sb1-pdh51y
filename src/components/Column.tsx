import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreVertical } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Column as ColumnType, Task } from '../types';

interface ColumnProps {
  column: ColumnType;
  onAddTask: (columnId: string, content: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function Column({ column, onAddTask, onDeleteTask }: ColumnProps) {
  const [newTask, setNewTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { setNodeRef } = useDroppable({ id: column.id });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask(column.id, newTask.trim());
      setNewTask('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-gray-800 w-80 rounded-lg p-4 flex flex-col max-h-[calc(100vh-2rem)] mr-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-200">{column.title}</h2>
        <button className="text-gray-400 opacity-50 hover:opacity-100">
          <MoreVertical size={20} />
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto">
        <SortableContext items={column.tasks.map((task: Task) => task.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
          ))}
        </SortableContext>
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="mt-2">
          <textarea
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
              if (e.key === 'Escape') {
                setIsAdding(false);
              }
            }}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 flex items-center gap-1 text-gray-400 hover:text-gray-300"
        >
          <Plus size={20} />
          <span>Add a task</span>
        </button>
      )}
    </div>
  );
}