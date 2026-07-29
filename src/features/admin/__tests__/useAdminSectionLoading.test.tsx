import React from 'react';
import { act } from 'react-test-renderer';
import { renderWithAct, unmountWithAct } from '../../../test-utils/reactTestRenderer';
import {
  useAdminSectionLoading,
} from '../useAdminSectionLoading';

type LoadingController = ReturnType<typeof useAdminSectionLoading>;

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

function HookHarness({ onRender }: { onRender: (controller: LoadingController) => void }) {
  onRender(useAdminSectionLoading());
  return null;
}

describe('useAdminSectionLoading', () => {
  it('keeps independent sections loading until their own request finishes', async () => {
    const overview = createDeferred<void>();
    const users = createDeferred<void>();
    let controller!: LoadingController;
    let overviewTask!: Promise<void>;
    let usersTask!: Promise<void>;

    const renderer = renderWithAct(
      <HookHarness onRender={value => {
        controller = value;
      }} />,
    );

    act(() => {
      overviewTask = controller.runWithSectionLoading('overview', () => overview.promise);
      usersTask = controller.runWithSectionLoading('users', () => users.promise);
    });

    expect(controller.loadingBySection.overview).toBe(true);
    expect(controller.loadingBySection.users).toBe(true);
    expect(controller.loadingBySection.plans).toBe(false);

    await act(async () => {
      overview.resolve();
      await overviewTask;
    });

    expect(controller.loadingBySection.overview).toBe(false);
    expect(controller.loadingBySection.users).toBe(true);

    await act(async () => {
      users.resolve();
      await usersTask;
    });

    expect(controller.loadingBySection.users).toBe(false);
    unmountWithAct(renderer);
  });

  it('does not clear a section while another request for that section is pending', async () => {
    const first = createDeferred<void>();
    const second = createDeferred<void>();
    let controller!: LoadingController;
    let firstTask!: Promise<void>;
    let secondTask!: Promise<void>;

    const renderer = renderWithAct(
      <HookHarness onRender={value => {
        controller = value;
      }} />,
    );

    act(() => {
      firstTask = controller.runWithSectionLoading('users', () => first.promise);
      secondTask = controller.runWithSectionLoading('users', () => second.promise);
    });

    await act(async () => {
      first.resolve();
      await firstTask;
    });

    expect(controller.loadingBySection.users).toBe(true);

    await act(async () => {
      second.resolve();
      await secondTask;
    });

    expect(controller.loadingBySection.users).toBe(false);
    unmountWithAct(renderer);
  });

  it('clears loading when a request rejects', async () => {
    const request = createDeferred<void>();
    let controller!: LoadingController;
    let task!: Promise<void>;

    const renderer = renderWithAct(
      <HookHarness onRender={value => {
        controller = value;
      }} />,
    );

    act(() => {
      task = controller.runWithSectionLoading('usage', () => request.promise);
    });

    await act(async () => {
      request.reject(new Error('network unavailable'));
      await expect(task).rejects.toThrow('network unavailable');
    });

    expect(controller.loadingBySection.usage).toBe(false);
    unmountWithAct(renderer);
  });
});
