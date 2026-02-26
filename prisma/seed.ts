import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("缺少 DATABASE_URL 环境变量");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface JsonChoice {
    id: string;
    text: string;
    text_zh?: string;
    isCorrect: boolean;
}

interface JsonQuestion {
    id: string;
    type?: string;
    stem: string;
    stem_zh?: string;
    choices: JsonChoice[];
    analysis: string;
    analysis_zh?: string;
    difficulty?: number;
    tags?: string[];
}

interface JsonFile {
    meta?: {
        sectionId: string;
        sectionTitle: string;
    };
    questions: JsonQuestion[];
}

const DATA_DIR = path.join(process.cwd(), "docs", "data");

// 分类映射
const categoryMap: Record<string, { id: string; title: string }> = {
    "1-Principes_et_valeurs_de_la_Republique_FR_ZH.json": {
        id: "principles",
        title: "Principes et valeurs de la République",
    },
    "2-Système_institutionnel_et_politique_FR_ZH.json": {
        id: "institutions",
        title: "Système institutionnel et politique",
    },
    "3-Droits_et_devoirs_FR_ZH.json": {
        id: "rights",
        title: "Droits et devoirs",
    },
    "4-Histoire_geographie_culture_FR_ZH.json": {
        id: "history",
        title: "Histoire, géographie et culture",
    },
    "5-Vivre_dans_la_societe_francaise_FR_ZH.json": {
        id: "society",
        title: "Vivre dans la société française",
    },
};

async function main() {
    console.log("🌱 Starting database seeding...\n");

    // 清空现有数据
    console.log("🗑️  Clearing existing data...");
    await prisma.choice.deleteMany();
    await prisma.question.deleteMany();
    await prisma.category.deleteMany();

    // 读取并导入每个 JSON 文件
    const files = Object.keys(categoryMap);
    let totalQuestions = 0;
    let totalChoices = 0;

    for (const filename of files) {
        const categoryInfo = categoryMap[filename];
        const filePath = path.join(DATA_DIR, filename);

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filename}, skipping...`);
            continue;
        }

        console.log(`\n📂 Processing: ${filename}`);

        // 读取 JSON 文件
        const content = fs.readFileSync(filePath, "utf-8");
        const data: JsonFile = JSON.parse(content);
        const questions = data.questions || [];

        // 创建分类
        await prisma.category.create({
            data: {
                id: categoryInfo.id,
                title: data.meta?.sectionTitle || categoryInfo.title,
            },
        });

        // 导入题目
        for (const q of questions) {
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
                        categoryId: categoryInfo.id,
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
                totalQuestions++;
                totalChoices += q.choices.length;
            } catch (err) {
                console.error(`  ❌ Failed to import question ${q.id}:`, err);
            }
        }

        console.log(`  ✅ Imported ${questions.length} questions`);
    }

    console.log("\n" + "=".repeat(50));
    console.log(`🎉 Seeding completed!`);
    console.log(`   - Categories: ${files.length}`);
    console.log(`   - Questions: ${totalQuestions}`);
    console.log(`   - Choices: ${totalChoices}`);
    console.log("=".repeat(50));
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
