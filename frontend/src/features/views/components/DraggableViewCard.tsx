import { ViewResponse } from "@/lib/client";
import { cn } from "@/lib/utils";
import { ViewCard } from "./ViewCard";

interface DraggableViewCardProps {
  view: ViewResponse;
  isEditable: boolean;
  order: number;
  draggedId: string | null;
  dragOverId: string | null;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
}

export function DraggableViewCard({
  view,
  isEditable,
  order,
  draggedId,
  dragOverId,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragLeave,
  handleDragEnd,
}: DraggableViewCardProps) {
  return (
    <div
      key={view.id}
      className={cn(
        "transition-all duration-100 ease-in-out transform rounded-xl bg-background",
        isEditable && "cursor-grab active:cursor-grabbing",
        draggedId === view.id &&
          "scale-95 opacity-40 shadow-md border-dashed border-2 border-primary rounded-md",
        dragOverId === view.id && draggedId !== view.id && "z-10",
      )}
      onDragStart={(e) => handleDragStart(e, view.id)}
      onDragOver={(e) => handleDragOver(e, view.id)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, view.id)}
      onDragEnd={handleDragEnd}
      draggable={isEditable}
    >
      <ViewCard view={view} isEditable={isEditable} order={order + 1} />
    </div>
  );
}
