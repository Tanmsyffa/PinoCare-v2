import MoodPage from "@/features/mood/pages/mood-page";

type Props = {
  params: Promise<{ type: string }>;
};

export default function Page(props: Props) {
  return <MoodPage {...props} />;
}
