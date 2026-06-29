'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export function useDragScroll() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mouseCoords = useRef({ startX: 0, startY: 0, scrollLeft: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = ref.current;
    if (!container) return;

    mouseCoords.current = {
      startX: e.pageX - container.offsetLeft,
      startY: e.pageY - container.offsetTop,
      scrollLeft: container.scrollLeft
    };
    setIsDragging(true);
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = ref.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walkX = (x - mouseCoords.current.startX) * 1.5;
    container.scrollLeft = mouseCoords.current.scrollLeft - walkX;
  }, [isDragging]);

  const handleMouseUpOrLeave = useCallback(() => {
    setIsDragging(false);
    const container = ref.current;
    if (container) {
      container.style.cursor = '';
      container.style.userSelect = '';
    }
  }, []);

  const handleCaptureClick = useCallback((e: MouseEvent) => {
    const container = ref.current;
    if (!container) return;

    const startX = mouseCoords.current.startX;
    const currentX = e.pageX - container.offsetLeft;

    const distance = Math.abs(currentX - startX);

    // If moved more than 5px, cancel click events
    if (distance > 5) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    container.addEventListener('click', handleCaptureClick, true);
    return () => {
      container.removeEventListener('click', handleCaptureClick, true);
    };
  }, [handleCaptureClick]);

  return {
    ref,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUpOrLeave,
    onMouseLeave: handleMouseUpOrLeave
  };
}
