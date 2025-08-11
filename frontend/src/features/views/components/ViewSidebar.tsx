import { ScrollArea } from "@/components/ui/scroll-area";
import { useViewReorder } from "../hooks/useViewReorder";
import { DraggableViewCard } from "./DraggableViewCard";

interface ViewsSidebarProps {
  entryId: string;
  isEditable: boolean;
  onSaveView: () => void;
}

export function ViewsSidebar({ entryId, isEditable }: ViewsSidebarProps) {
  const {
    views,
    draggedId,
    dragOverId,
    handleDragEnd,
    handleDragLeave,
    handleDragOver,
    handleDragStart,
    handleDrop,
  } = useViewReorder(entryId, isEditable);

  return (
    <ScrollArea className="h-full p-3 border rounded-md overflow-clip">
      <div className="space-y-3">
        {views?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No views saved yet</p>
          </div>
        ) : (
          <>
            {views?.map((view, index) => (
              <DraggableViewCard
                key={view.id}
                view={view}
                order={index}
                isEditable={isEditable}
                draggedId={draggedId}
                dragOverId={dragOverId}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
                handleDragLeave={handleDragLeave}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
              />
            ))}
          </>
        )}
      </div>
    </ScrollArea>
  );
}
