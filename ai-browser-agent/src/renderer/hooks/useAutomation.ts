import { useCallback } from 'react';
import { useElectron } from './useElectron';
import { useAppStore } from '../store/app.store';
import { BrowserAction } from '../../shared/types';

export function useAutomation() {
  const electron = useElectron();
  const {
    setAutomationStatus,
    setAiOutput,
    setAiLoading,
    addLog,
    setBrowserUrl,
    setBrowserStatus,
    settings,
    activeSessionId,
  } = useAppStore();

  const launchBrowser = useCallback(
    async (url: string) => {
      setBrowserStatus('loading');
      const result = await electron.browserLaunch(url, settings.headlessMode);
      if (result.success) {
        setBrowserUrl(url);
        setBrowserStatus('ready');
      } else {
        setBrowserStatus('error');
        addLog({
          id: crypto.randomUUID(),
          level: 'error',
          message: `Browser launch failed: ${result.error}`,
          timestamp: new Date(),
        });
      }
      return result;
    },
    [electron, settings.headlessMode, setBrowserUrl, setBrowserStatus, addLog]
  );

  const executeTask = useCallback(
    async (instruction: string) => {
      if (!activeSessionId) return;

      setAiLoading(true);
      setAutomationStatus('running');

      try {
        // Get current page content
        const contentResult = await (electron as unknown as { browserGetContent: () => Promise<{ success: boolean; content?: string; url?: string }> }).browserGetContent?.() ?? { success: true, content: '' };
        const pageContent = contentResult.success ? (contentResult.content || '') : '';

        // Interpret task
        const interpreted = await electron.aiInterpretTask(instruction, pageContent);
        if (!interpreted.success) {
          throw new Error(interpreted.error || 'Task interpretation failed');
        }

        addLog({
          id: crypto.randomUUID(),
          level: 'info',
          message: `Task interpreted: ${interpreted.summary}`,
          timestamp: new Date(),
        });

        // Execute each action
        const actions = (interpreted.actions || []) as BrowserAction[];
        for (const action of actions) {
          if (action.requiresApproval && settings.approvalMode === 'manual') {
            addLog({
              id: crypto.randomUUID(),
              level: 'warn',
              message: `Awaiting approval: ${action.description}`,
              timestamp: new Date(),
            });
          }

          const actionResult = await electron.browserAction(action);
          addLog({
            id: crypto.randomUUID(),
            level: actionResult.success ? 'success' : 'error',
            message: actionResult.success
              ? `✓ ${action.description}`
              : `✗ ${action.description}: ${actionResult.error}`,
            timestamp: new Date(),
          });
        }

        setAutomationStatus('idle');
      } catch (error) {
        setAutomationStatus('stopped');
        addLog({
          id: crypto.randomUUID(),
          level: 'error',
          message: `Task failed: ${String(error)}`,
          timestamp: new Date(),
        });
      } finally {
        setAiLoading(false);
      }
    },
    [electron, activeSessionId, settings.approvalMode, setAiLoading, setAutomationStatus, addLog]
  );

  const runStudyMode = useCallback(
    async (content: string, types: string[]) => {
      setAiLoading(true);
      try {
        const result = await electron.aiStudyMode(content, types);
        if (result.success && result.content) {
          setAiOutput(result.content);
        } else {
          throw new Error(result.error || 'Study mode failed');
        }
      } catch (error) {
        addLog({
          id: crypto.randomUUID(),
          level: 'error',
          message: `Study mode failed: ${String(error)}`,
          timestamp: new Date(),
        });
      } finally {
        setAiLoading(false);
      }
    },
    [electron, setAiLoading, setAiOutput, addLog]
  );

  const runGeneralAI = useCallback(
    async (instruction: string, content: string) => {
      setAiLoading(true);
      try {
        const result = await electron.aiGeneral(instruction, content);
        if (result.success && result.content) {
          setAiOutput(result.content);
        } else {
          throw new Error(result.error || 'AI request failed');
        }
      } catch (error) {
        addLog({
          id: crypto.randomUUID(),
          level: 'error',
          message: `AI request failed: ${String(error)}`,
          timestamp: new Date(),
        });
      } finally {
        setAiLoading(false);
      }
    },
    [electron, setAiLoading, setAiOutput, addLog]
  );

  const pauseAutomation = useCallback(async () => {
    await electron.browserPause();
    setAutomationStatus('paused');
  }, [electron, setAutomationStatus]);

  const resumeAutomation = useCallback(async () => {
    await electron.browserResume();
    setAutomationStatus('running');
  }, [electron, setAutomationStatus]);

  const stopAutomation = useCallback(async () => {
    await electron.browserStop();
    setAutomationStatus('stopped');
  }, [electron, setAutomationStatus]);

  return {
    launchBrowser,
    executeTask,
    runStudyMode,
    runGeneralAI,
    pauseAutomation,
    resumeAutomation,
    stopAutomation,
  };
}
