import AdminLayout from "@/components/admin/AdminLayout";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login?next=/admin");
    }

    if (user.role !== "ADMIN") {
        redirect("/");
    }

    return <AdminLayout>{children}</AdminLayout>;
}
