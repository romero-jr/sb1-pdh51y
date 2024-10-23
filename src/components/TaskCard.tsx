import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grip, X } from 'lucide-react';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-700 p-3 rounded-lg shadow-md border border-gray-600 mb-2 group hover:border-gray-500"
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-1 text-gray-400 opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <Grip size={16} />
        </button>
        <p className="flex-1 text-gray-200">{task.content}</p>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}