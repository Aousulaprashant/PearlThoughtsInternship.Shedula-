"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Doctor, Prescription, Review } from "./types";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

export function useDoctor(doctorId: string) {
  const [data, setData] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiGet<Doctor>(`/doctors/${doctorId}`)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [doctorId]);

  return { data, loading, error };
}

export function usePrescriptions(doctorId: string, patientId?: string) {
  const [data, setData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = `/prescriptions?doctorId=${doctorId}`;
    if (patientId) q += `&patientId=${patientId}`;
    let active = true;
    setLoading(true);
    apiGet<Prescription[]>(q)
      .then((d) => active && setData(Array.isArray(d) ? d : []))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [doctorId, patientId]);

  return { data, loading, error };
}

export function useReviews(doctorId: string) {
  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    apiGet<Review[]>(`/reviews?doctorId=${doctorId}&_sort=date&_order=desc`)
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const average = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((a, b) => a + (b.rating || 0), 0) / data.length;
  }, [data]);

  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<
      1 | 2 | 3 | 4 | 5,
      number
    >;
    data.forEach((r) => {
      const key = Math.min(5, Math.max(1, Math.round(r.rating))) as
        | 1
        | 2
        | 3
        | 4
        | 5;
      counts[key] += 1;
    });
    return counts;
  }, [data]);

  const postReview = useCallback(
    async (
      payload: Omit<Review, "id" | "date"> & { id?: string; date?: string }
    ) => {
      const tempId = `temp-${Date.now()}`;
      const optimistic: Review = {
        id: tempId,
        date: new Date().toISOString(),
        ...payload,
      } as Review;
      setData((s) => [optimistic, ...s]);
      try {
        const saved = await apiPost<Review>("/reviews", {
          ...payload,
          id: payload.id ?? `r-${Date.now()}`,
          date: new Date().toISOString(),
        });
        setData((s) => s.map((r) => (r.id === tempId ? saved : r)));
        return { ok: true } as const;
      } catch (e) {
        setData((s) => s.filter((r) => r.id !== tempId));
        return { ok: false, error: (e as Error).message } as const;
      }
    },
    []
  );

  return { data, loading, error, average, distribution, refresh, postReview };
}
