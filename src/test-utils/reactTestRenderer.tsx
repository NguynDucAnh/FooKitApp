import type { ReactElement } from 'react';
import TestRenderer, { act } from 'react-test-renderer';

export function renderWithAct(element: ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(element);
  });

  return renderer;
}

export function unmountWithAct(renderer: TestRenderer.ReactTestRenderer) {
  act(() => {
    renderer.unmount();
  });
}
