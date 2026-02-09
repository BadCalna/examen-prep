import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ImportQuestion {
    id: string;
    type?: string;
    stem: string;
    stem_zh?: string;
    choices: {
        id: string;
        text: string;
        text_zh?: string;
        isCorrect: boolean;
    }[];
    analysis?: string;
    analysis_zh?: string;
    difficulty?: number;
    tags?: string[];
}

interface ImportData {
    questions?: ImportQuestion[];
}

// POST: 导入题目
export async function POST(request: NextRequest) {
    try {
        const {
            data,
            categoryId,
            mode = "append",
        }: {
            data: ImportData;
            categoryId: string;
            mode?: "append" | "replace";
        } = await request.json();

        if (!data || !categoryId) {
            return NextResponse.json({ error: "Missing data or categoryId" }, { status: 400 });
        }

        // 验证分类是否存在
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // 验证导入数据格式
        const questions = data.questions || [];
        if (!Array.isArray(questions)) {
            return NextResponse.json({ error: "Invalid data format: questions must be an array" }, { status: 400 });
        }

        // 验证每个题目的必填字段
        const validationErrors: string[] = [];
        questions.forEach((q, index) => {
            if (!q.id) validationErrors.push(`Question ${index + 1}: missing id`);
            if (!q.stem) validationErrors.push(`Question ${index + 1}: missing stem`);
            if (!q.choices || !Array.isArray(q.choices)) {
                validationErrors.push(`Question ${index + 1}: missing or invalid choices`);
            }
        });

        if (validationErrors.length > 0) {
            return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 });
        }

        if (mode === "replace") {
            // 替换模式：先删除该分类的所有题目
            await prisma.question.deleteMany({
                where: { categoryId },
            });
        }

        // 获取已存在的题目 ID
        const existingQuestions = await prisma.question.findMany({
            where: { id: { in: questions.map((q) => q.id) } },
            select: { id: true },
        });
        const existingIds = new Set(existingQuestions.map((q) => q.id));

        // 导入新题目
        let imported = 0;
        let skipped = 0;

        for (const q of questions) {
            if (existingIds.has(q.id)) {
                skipped++;
                continue;
            }

            try {
                await prisma.question.create({
                    data: {
                        id: q.id,
                        type: q.type || "single",
                        stem: q.stem,
                        stemZh: q.stem_zh,
                        analysis: q.analysis || "",
                        analysisZh: q.analysis_zh,
                        difficulty: q.difficulty || 2,
                        tags: q.tags ? JSON.stringify(q.tags) : null,
                        categoryId,
                        choices: {
                            create: q.choices.map((c) => ({
                                originalId: c.id,
                                text: c.text,
                                textZh: c.text_zh,
                                isCorrect: c.isCorrect,
                            })),
                        },
                    },
                });
                imported++;
            } catch (err) {
                console.error(`Failed to import question ${q.id}:`, err);
            }
        }

        // 获取分类总题目数
        const total = await prisma.question.count({
            where: { categoryId },
        });

        return NextResponse.json({
            success: true,
            imported,
            skipped,
            total,
        });
    } catch (error) {
        console.error("Failed to import questions:", error);
        return NextResponse.json({ error: "Failed to import questions" }, { status: 500 });
    }
}

// GET: 获取可用的分类列表
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { questions: true },
                },
            },
        });

        const categoryList = categories.map((cat) => ({
            categoryId: cat.id,
            title: cat.title,
            count: cat._count.questions,
        }));

        return NextResponse.json({ categories: categoryList });
    } catch (error) {
        console.error("Failed to get category list:", error);
        return NextResponse.json({ error: "Failed to get category list" }, { status: 500 });
    }
}
