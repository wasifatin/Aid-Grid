'use client';

import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const emptySubscribe = () => () => {};

/**
 * Renders modal overlays directly into document.body so parent transforms,
 * filters, perspective containers, or sticky stacking contexts never trap
 * `position: fixed` elements away from the viewport center.
 */
export default function ModalPortal({ children }: { children: React.ReactNode }) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) return null;
  return createPortal(children, document.body);
}
