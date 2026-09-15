import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';

interface FocusTrapOptions {
  onEscape?: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocus?: boolean;
  preventScroll?: boolean;
}

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean,
  options: FocusTrapOptions = {}
) {
  const { onEscape, initialFocusRef, returnFocus = true, preventScroll = true } = options;
  const containerRef = useRef<T>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Save previously active element to restore focus on close
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Prevent body scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }

    // Set initial focus
    const timer = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }

      const focusable = Array.from(
        containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      ) as HTMLElement[];
      if (focusable.length > 0) {
        focusable[0]?.focus();
      } else {
        containerRef.current.focus();
      }
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current) return;

      // Handle Escape key
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onEscape?.();
        return;
      }

      // Handle Tab key focus trap
      if (event.key === 'Tab') {
        const rawElements = Array.from(
          containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        ) as HTMLElement[];
        const focusableElements = rawElements.filter(
          (el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0
        );

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey) {
          // Backward tab
          if (activeElement === firstElement || !containerRef.current.contains(activeElement)) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Forward tab
          if (activeElement === lastElement || !containerRef.current.contains(activeElement)) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener('keydown', handleKeyDown);

      if (preventScroll) {
        document.body.style.overflow = originalOverflow;
      }

      if (returnFocus && previousActiveElementRef.current) {
        // Return focus to the element that triggered the modal
        const elToFocus = previousActiveElementRef.current;
        requestAnimationFrame(() => {
          if (elToFocus && typeof elToFocus.focus === 'function') {
            elToFocus.focus();
          }
        });
      }
    };
  }, [isActive, onEscape, initialFocusRef, returnFocus, preventScroll]);

  return containerRef;
}
