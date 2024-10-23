import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Layout, Plus } from 'lucide-react';
import { Column } from './components/Column';
import { TaskCard } from './components/TaskCard';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Board, Column as ColumnType, Task } from './types';

const initialBoard: Board = {
  columns: [
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] },
  ],
};

function App() {
  const [board, setBoard] = useLocalStorage<Board>('kanban-board', initialBoard);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = board.columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = board.columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === active.id);
    
    if (!activeTask) return;

    const overColumnId = over.id as string;
    
    setBoard((board) => {
      const oldColumnId = activeTask.columnId;
      
      if (oldColumnId === overColumnId) {
        const column = board.columns.find((col) => col.id === oldColumnId);
        if (!column) return board;

        const oldIndex = column.tasks.findIndex((task) => task.id === active.id);
        const newIndex = column.tasks.findIndex((task) => task.id === over.id);

        const newTasks = arrayMove(column.tasks, oldIndex, newIndex);

        return {
          ...board,
          columns: board.columns.map((col) =>
            col.id === oldColumnId ? { ...col, tasks: newTasks } : col
          ),
        };
      }

      return {
        ...board,
        columns: board.columns.map((col) => {
          if (col.id === oldColumnId) {
            return {
              ...col,
              tasks: col.tasks.filter((task) => task.id !== active.id),
            };
          }
          if (col.id === overColumnId) {
            return {
              ...col,
              tasks: [...col.tasks, { ...activeTask, columnId: overColumnId }],
            };
          }
          return col;
        }),
      };
    });

    setActiveTask(null);
  };

  const handleAddTask = (columnId: string, content: string) => {
    setBoard((board) => ({
      ...board,
      columns: board.columns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              tasks: [
                ...col.tasks,
                {
                  id: crypto.randomUUID(),
                  content,
                  columnId,
                },
              ],
            }
          : col
      ),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setBoard((board) => ({
      ...board,
      columns: board.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((task) => task.id !== taskId),
      })),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2">
          <Layout className="text-blue-400" />
          <h1 className="text-xl font-semibold text-gray-100">Offline Kanban</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex overflow-x-auto pb-4">
            {board.columns.map((column: ColumnType) => (
              <Column
                key={column.id}
                column={column}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
            <button className="flex items-center justify-center w-80 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700 text-gray-400 hover:text-gray-300 hover:border-gray-600 transition-colors">
              <Plus className="mr-2" />
              Add another list
            </button>
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} onDelete={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}

export default App;