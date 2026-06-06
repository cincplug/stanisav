import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

const DragContext = createContext(null);

export const DragProvider = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  // Counts active drag gestures so overlapping drags don't cancel each other
  const activeDragCountRef = useRef(0);

  const notifyDragStart = useCallback(() => {
    activeDragCountRef.current += 1;
    setIsDragging(true);
  }, []);

  const notifyDragEnd = useCallback(() => {
    activeDragCountRef.current = Math.max(0, activeDragCountRef.current - 1);
    if (activeDragCountRef.current === 0) setIsDragging(false);
  }, []);

  return (
    <DragContext.Provider
      value={{ isDragging, notifyDragStart, notifyDragEnd }}
    >
      {children}
    </DragContext.Provider>
  );
};

export const useDragContext = () => {
  const context = useContext(DragContext);
  if (!context)
    throw new Error("useDragContext must be used within DragProvider");
  return context;
};
