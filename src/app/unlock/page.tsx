import UnlockForm from "@/features/auth/components/unlock-form";

export const dynamic = "force-dynamic";

type UnlockPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

function getSafeNextPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  if (next.startsWith("/unlock")) {
    return "/";
  }

  return next;
}

export default async function UnlockPage({ searchParams }: UnlockPageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);

  return <UnlockForm nextPath={nextPath} />;
}
