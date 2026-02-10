import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // 获取所有分类及其题目数量
        const categoriesData = await prisma.category.findMany({
            include: {
                _count: {
                    select: { questions: true },
                },
            },
        });

        const categories = categoriesData.map((cat) => ({
            name: cat.title,
            count: cat._count.questions,
            categoryId: cat.id,
        }));

        const total = categories.reduce((sum, cat) => sum + cat.count, 0);

        return NextResponse.json({ categories, total });
    } catch (error) {
        console.error("Failed to get stats:", error);
        return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
    }
}
