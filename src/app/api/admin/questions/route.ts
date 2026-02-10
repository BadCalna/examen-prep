import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 获取所有题目或按分类筛选
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("category");
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        // 构建查询条件
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (search) {
            where.OR = [
                { stem: { contains: search } },
                { stemZh: { contains: search } },
                { id: { contains: search } },
            ];
        }

        // 获取总数
        const total = await prisma.question.count({ where });

        // 获取分页数据
        const questions = await prisma.question.findMany({
            where,
            include: {
                choices: true,
                category: true,
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { id: "asc" },
        });

        // 转换为前端期望的格式
        const formattedQuestions = questions.map((q) => ({
            id: q.id,
            type: q.type,
            stem: q.stem,
            stem_zh: q.stemZh,
            choices: q.choices.map((c) => ({
                id: c.originalId,
                text: c.text,
                text_zh: c.textZh,
                isCorrect: c.isCorrect,
            })),
            analysis: q.analysis,
            analysis_zh: q.analysisZh,
            difficulty: q.difficulty,
            tags: q.tags ? JSON.parse(q.tags) : [],
            _category: q.category.title,
            _categoryId: q.categoryId,
        }));

        return NextResponse.json({
            questions: formattedQuestions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Failed to get questions:", error);
        return NextResponse.json({ error: "Failed to get questions" }, { status: 500 });
    }
}

// POST: 添加新题目
export async function POST(request: NextRequest) {
    try {
        const { question, categoryId } = await request.json();

        if (!question || !categoryId) {
            return NextResponse.json({ error: "Missing question or categoryId" }, { status: 400 });
        }

        // 检查 ID 是否已存在
        const existing = await prisma.question.findUnique({
            where: { id: question.id },
        });

        if (existing) {
            return NextResponse.json({ error: "Question ID already exists" }, { status: 400 });
        }

        // 创建新题目
        const newQuestion = await prisma.question.create({
            data: {
                id: question.id,
                type: question.type || "single",
                stem: question.stem,
                stemZh: question.stem_zh,
                analysis: question.analysis || "",
                analysisZh: question.analysis_zh,
                difficulty: question.difficulty || 2,
                tags: question.tags ? JSON.stringify(question.tags) : null,
                categoryId,
                choices: {
                    create: (question.choices || []).map((c: { id: string; text: string; text_zh?: string; isCorrect: boolean }) => ({
                        originalId: c.id,
                        text: c.text,
                        textZh: c.text_zh,
                        isCorrect: c.isCorrect,
                    })),
                },
            },
            include: {
                choices: true,
            },
        });

        return NextResponse.json({ success: true, question: newQuestion });
    } catch (error) {
        console.error("Failed to add question:", error);
        return NextResponse.json({ error: "Failed to add question" }, { status: 500 });
    }
}

// DELETE: 删除题目
export async function DELETE(request: NextRequest) {
    try {
        const { questionId } = await request.json();

        if (!questionId) {
            return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
        }

        // 检查题目是否存在
        const existing = await prisma.question.findUnique({
            where: { id: questionId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // 删除题目（选项会级联删除）
        await prisma.question.delete({
            where: { id: questionId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete question:", error);
        return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
    }
}
