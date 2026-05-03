export type Journal = {
  id: string;
  title: string;
  content: string;
  mood: string;
  photo_url: string | null;
  photo_path?: string | null;
  date: string;
  created_at: string;
};
