import { logoutAction } from "@/app/actions";
import { Button, Card, PageHeader } from "@/components/ui";

export default function LogoutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4">
      <Card className="w-full max-w-md">
        <PageHeader title="退出登录" description="清除当前浏览器里的访问令牌。" />
        <form action={logoutAction}>
          <Button type="submit" className="w-full">退出</Button>
        </form>
      </Card>
    </main>
  );
}
