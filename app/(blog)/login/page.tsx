import { PinForm } from "@/entities/auth/ui/PinForm";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const nextPath =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/create";

  return <PinForm nextPath={nextPath} />;
}
