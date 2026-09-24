import { useCallback, useEffect, useState } from 'react';
import { createProblem, deleteProblem, listProblems, updateProblem } from './problemsApi';

export function useProblems() {
  const [state, setState] = useState({ status: 'loading', problems: [], error: null });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, status: s.problems.length ? 'ready' : 'loading', error: null }));
    try {
      const problems = await listProblems();
      setState({ status: 'ready', problems, error: null });
    } catch (error) {
      setState((s) => ({ ...s, status: 'error', error }));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (input) => {
    const created = await createProblem(input);
    setState((s) => ({ ...s, problems: [created, ...s.problems] }));
    return created;
  }, []);

  const update = useCallback(async (id, input) => {
    const updated = await updateProblem(id, input);
    setState((s) => ({ ...s, problems: s.problems.map((p) => (p.id === id ? updated : p)) }));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteProblem(id);
    setState((s) => ({ ...s, problems: s.problems.filter((p) => p.id !== id) }));
  }, []);

  return { ...state, reload, create, update, remove };
}
