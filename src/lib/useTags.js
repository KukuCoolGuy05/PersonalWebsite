import { useCallback, useEffect, useState } from 'react';
import { createTag, deleteTag, listTags } from './problemsApi';

export function useTags() {
  const [state, setState] = useState({ status: 'loading', tags: [], error: null });

  const reload = useCallback(async () => {
    try {
      const tags = await listTags();
      setState({ status: 'ready', tags, error: null });
    } catch (error) {
      setState({ status: 'error', tags: [], error });
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (tag) => {
    const created = await createTag(tag);
    setState((s) => ({ ...s, tags: [...s.tags, created] }));
    return created;
  }, []);

  const remove = useCallback(async (name) => {
    await deleteTag(name);
    setState((s) => ({ ...s, tags: s.tags.filter((t) => t.name !== name) }));
  }, []);

  return { ...state, reload, create, remove };
}
