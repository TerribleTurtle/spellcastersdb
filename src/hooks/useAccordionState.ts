import { useState } from 'react';

type AccordionState = boolean[];

export function useAccordionState(count: number, initialOpenIndex: number = 0, allowMultiple: boolean = false) {
  const [expandedState, setExpandedState] = useState<AccordionState>(() => {
    const arr = new Array(count).fill(false);
    if (initialOpenIndex >= 0 && initialOpenIndex < count) {
      arr[initialOpenIndex] = true;
    }
    return arr;
  });

  const toggle = (index: number, isOpen: boolean) => {
    if (isOpen) {
      if (allowMultiple) {
         // Opening one just opens it
         setExpandedState((prev) => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
         });
      } else {
         // Opening one closes others (Accordion behavior)
         const newState = new Array(count).fill(false);
         newState[index] = true;
         setExpandedState(newState);
      }
    } else {
      // Closing one just closes it
      setExpandedState((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    }
  };

  const collapseAll = () => setExpandedState(new Array(count).fill(false));
  const expandAll = () => setExpandedState(new Array(count).fill(true));
  
  const areAllCollapsed = expandedState.every((s) => !s);

  return {
    expandedState,
    toggle,
    collapseAll,
    expandAll,
    areAllCollapsed
  };
}
