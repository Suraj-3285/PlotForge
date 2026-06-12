
export const timeAgo = (date: string): string => {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months= Math.floor(days / 30);

  if (months > 0) return `${months}mo ago`;
  if (weeks  > 0) return `${weeks}w ago`;
  if (days   > 0) return `${days}d ago`;
  if (hours  > 0) return `${hours}h ago`;
  if (mins   > 0) return `${mins}m ago`;
  return 'just now';
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
};

export const formatDateShort = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year:  'numeric',
  });
};


export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const formatWordCount = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k words`;
  return `${count} words`;
};


export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '...';
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};