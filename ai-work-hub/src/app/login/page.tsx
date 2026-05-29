import { Button, Card, PageHeader, TextInput } from "@/components/ui";
import { loginAction } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4">
      <Card className="w-full max-w-md">
        <PageHeader title="登录 AI Work Hub" description="输入访问令牌后继续使用智能工作台。" />
        {params.error ? <p className="mb-3 rounded-md bg-rose-50 p-3 text-sm text-rose-700">令牌不正确。</p> : null}
        <form action={loginAction} className="space-y-3">
          <TextInput name="token" type="password" placeholder="AI_WORK_HUB_ACCESS_TOKEN" autoFocus />
          <Button type="submit" className="w-full">登录</Button>
        </form>
      </Card>
    </main>
  );
}
