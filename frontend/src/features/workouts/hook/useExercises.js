import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchExercises } from "@data/exercises/exercises.repository";

export function useExercises({ limit = 20 } = {}) {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lastControllerRef = useRef(null);

  const canLoadMore = useMemo(
    () => items.length < count,
    [items.length, count]
  );

  const abortLast = useCallback(() => {
    if (lastControllerRef.current) {
      lastControllerRef.current.abort();
      lastControllerRef.current = null;
    }
  }, []);

  const refetch = useCallback(async () => {
    abortLast();
    const controller = new AbortController();
    lastControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchExercises({
        limit,
        offset: 0,
        signal: controller.signal,
      });

      setItems(data.results);
      setCount(data.count);
      setOffset(limit);
    } catch (e) {
      if (e?.code !== "ABORTED") setError(e);
    } finally {
      setLoading(false);
    }
  }, [abortLast, limit]);

  useEffect(() => {
    refetch();
    return () => abortLast();
  }, [refetch, abortLast]);

  const loadMore = useCallback(async () => {
    if (loading) return;

    abortLast();
    const controller = new AbortController();
    lastControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchExercises({
        limit,
        offset,
        signal: controller.signal,
      });

      setItems((prev) => [...prev, ...data.results]);
      setOffset((prev) => prev + limit);
      setCount(data.count);
    } catch (e) {
      if (e?.code !== "ABORTED") setError(e);
    } finally {
      setLoading(false);
    }
  }, [abortLast, limit, offset, loading]);

  return { items, loading, error, loadMore, canLoadMore, refetch, count };
}