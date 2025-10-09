import { useEffect, useState, useCallback } from 'react';

/**
 * Hook para detectar cuando se presiona una tecla específica
 * Útil para keyboard shortcuts, cerrar modales con ESC, etc.
 * 
 * @param targetKey - Tecla a detectar (ej: 'Escape', 'Enter', 'ArrowDown')
 * @param handler - Función a ejecutar cuando se presiona la tecla
 * @param options - Opciones adicionales
 * 
 * @example
 * // Cerrar modal con ESC
 * useKeyPress('Escape', () => {
 *   setIsOpen(false);
 * }, { when: isOpen });
 * 
 * @example
 * // Detectar si está presionada
 * const isShiftPressed = useKeyPress('Shift');
 */
export function useKeyPress(
  targetKey: string,
  handler?: (event: KeyboardEvent) => void,
  options: {
    when?: boolean;
    preventDefault?: boolean;
    event?: 'keydown' | 'keyup';
  } = {}
): boolean {
  const {
    when = true,
    preventDefault = false,
    event = 'keydown',
  } = options;

  const [isKeyPressed, setIsKeyPressed] = useState(false);

  const downHandler = useCallback(
    (e: KeyboardEvent) => {
      if (!when) return;

      if (e.key === targetKey) {
        if (preventDefault) {
          e.preventDefault();
        }

        setIsKeyPressed(true);
        
        if (handler) {
          console.log(`⌨️ Tecla presionada: ${targetKey}`);
          handler(e);
        }
      }
    },
    [targetKey, handler, when, preventDefault]
  );

  const upHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === targetKey) {
        setIsKeyPressed(false);
      }
    },
    [targetKey]
  );

  useEffect(() => {
    if (!when) {
      return;
    }

    window.addEventListener(event, downHandler as any);
    window.addEventListener('keyup', upHandler as any);

    return () => {
      window.removeEventListener(event, downHandler as any);
      window.removeEventListener('keyup', upHandler as any);
    };
  }, [event, downHandler, upHandler, when]);

  return isKeyPressed;
}

/**
 * Hook para detectar combinaciones de teclas (ej: Ctrl+S)
 * 
 * @example
 * useKeyCombo(['Control', 's'], () => {
 *   console.log('Guardando...');
 * }, { preventDefault: true });
 */
export function useKeyCombo(
  keys: string[],
  handler: (event: KeyboardEvent) => void,
  options: {
    when?: boolean;
    preventDefault?: boolean;
  } = {}
) {
  const { when = true, preventDefault = false } = options;
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!when) {
      return;
    }

    const downHandler = (e: KeyboardEvent) => {
      setPressedKeys((prev) => new Set(prev).add(e.key));

      // Verificar si todas las teclas están presionadas
      const allKeysPressed = keys.every((key) => 
        pressedKeys.has(key) || e.key === key
      );

      if (allKeysPressed) {
        if (preventDefault) {
          e.preventDefault();
        }
        console.log(`⌨️ Combo detectado: ${keys.join('+')}`);
        handler(e);
      }
    };

    const upHandler = (e: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(e.key);
        return newSet;
      });
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
      setPressedKeys(new Set());
    };
  }, [keys, handler, when, preventDefault, pressedKeys]);
}

/**
 * Shortcuts comunes pre-configurados
 */
export const useEscapeKey = (handler: () => void, when = true) => {
  useKeyPress('Escape', handler, { when });
};

export const useEnterKey = (handler: () => void, when = true) => {
  useKeyPress('Enter', handler, { when });
};

export const useArrowKeys = (handlers: {
  up?: () => void;
  down?: () => void;
  left?: () => void;
  right?: () => void;
}, when = true) => {
  useKeyPress('ArrowUp', handlers.up, { when, preventDefault: true });
  useKeyPress('ArrowDown', handlers.down, { when, preventDefault: true });
  useKeyPress('ArrowLeft', handlers.left, { when, preventDefault: true });
  useKeyPress('ArrowRight', handlers.right, { when, preventDefault: true });
};
