import { useEffect, useState, type DependencyList } from "react";
import {
  AboutContent,
  BlogRecord,
  Category,
  ContactSettings,
  fetchAboutContent,
  fetchBlogs,
  fetchCategories,
  fetchContactSettings,
  fetchHomeContent,
  fetchSiteSettings,
  fetchTestimonials,
  HomeContent,
  SiteSettings,
  TestimonialRecord,
} from "@/lib/api";

function useAsyncResource<T>(fetcher: () => Promise<T>, initialValue: T, deps: DependencyList = []) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const value = await fetcher();
        if (active) setData(value);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load content");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, deps);

  return { data, loading, error, setData };
}

export function useHomeContent() {
  return useAsyncResource<HomeContent | null>(fetchHomeContent, null);
}

export function useAboutContent() {
  return useAsyncResource<AboutContent | null>(fetchAboutContent, null);
}

export function useContactSettings() {
  return useAsyncResource<ContactSettings | null>(fetchContactSettings, null);
}

export function useSiteSettings() {
  return useAsyncResource<SiteSettings>(fetchSiteSettings, {});
}

export function useCategories() {
  return useAsyncResource<Category[]>(() => fetchCategories(), []);
}

export function useTestimonials() {
  return useAsyncResource<TestimonialRecord[]>(() => fetchTestimonials(), []);
}

export function useBlogs() {
  return useAsyncResource<BlogRecord[]>(() => fetchBlogs(), []);
}

export function useBlogListAll() {
  return useAsyncResource<BlogRecord[]>(() => fetchBlogs({ all: true, allowFallback: false }), []);
}
