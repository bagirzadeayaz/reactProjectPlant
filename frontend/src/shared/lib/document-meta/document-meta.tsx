import { useEffect } from 'react';

export interface DocumentMetaProps {
  title: string;
  description?: string;
  /** `noindex` for admin and error pages. */
  robots?: string;
}

const setMeta = (name: string, content: string | undefined): void => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (content === undefined) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = name;
    document.head.append(tag);
  }
  tag.content = content;
};

/**
 * Sets the document title and the two meta tags the app changes per page.
 *
 * A component rather than a hook so a page can declare its metadata beside
 * its markup, the way it did with react-helmet-async — which this replaces:
 * three tags do not need a provider, a context and a dependency in the
 * entry bundle. Renders nothing. The last one to mount wins, which is the
 * page currently on screen.
 */
export const DocumentMeta = ({ title, description, robots }: DocumentMetaProps) => {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('robots', robots);
  }, [title, description, robots]);

  return null;
};
