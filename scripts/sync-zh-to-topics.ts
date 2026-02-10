/**
 * 同步中文翻译到 public/data/topics/*.json
 * 
 * 从 docs/data/*_FR_ZH.json 读取 stem_zh / analysis_zh / text_zh，
 * 按 question id 匹配写入 public/data/topics/*.json。
 */

import * as fs from "fs";
import * as path from "path";

const DOCS_DIR = path.join(process.cwd(), "docs", "data");
const TOPICS_DIR = path.join(process.cwd(), "public", "data", "topics");

// 源文件到 topic slug 的映射
const SOURCE_MAP: Record<string, string> = {
    "1-Principes_et_valeurs_de_la_Republique_FR_ZH.json": "values",
    "2-Système_institutionnel_et_politique_FR_ZH.json": "institutions",
    "3-Droits_et_devoirs_FR_ZH.json": "rights",
    "4-Histoire_geographie_culture_FR_ZH.json": "history",
    "5-Vivre_dans_la_societe_francaise_FR_ZH.json": "society",
};

interface SourceChoice {
    id: string;
    text: string;
    text_zh?: string;
    isCorrect: boolean;
}

interface SourceQuestion {
    id: string;
    stem_zh?: string;
    analysis_zh?: string;
    choices: SourceChoice[];
}

interface TopicChoice {
    id: string;
    text: string;
    textZh?: string;
    isCorrect: boolean;
}

interface TopicQuestion {
    id: string;
    stem: string;
    stemZh?: string;
    analysis: string;
    analysisZh?: string;
    choices: TopicChoice[];
    [key: string]: unknown;
}

interface TopicFile {
    meta: Record<string, unknown>;
    questions: TopicQuestion[];
}

function main() {
    let totalSynced = 0;

    for (const [sourceFile, slug] of Object.entries(SOURCE_MAP)) {
        const sourcePath = path.join(DOCS_DIR, sourceFile);
        const topicPath = path.join(TOPICS_DIR, `${slug}.json`);

        if (!fs.existsSync(sourcePath)) {
            console.log(`⚠️  源文件不存在: ${sourceFile}`);
            continue;
        }
        if (!fs.existsSync(topicPath)) {
            console.log(`⚠️  主题文件不存在: ${slug}.json`);
            continue;
        }

        // 读取源文件，构建 id → 翻译的查找表
        const sourceData = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));
        const sourceQuestions: SourceQuestion[] = sourceData.questions || [];

        const zhMap = new Map<
            string,
            {
                stemZh?: string;
                analysisZh?: string;
                choicesZh: Map<string, string>;
            }
        >();

        for (const sq of sourceQuestions) {
            const choicesZh = new Map<string, string>();
            for (const sc of sq.choices || []) {
                if (sc.text_zh) {
                    choicesZh.set(sc.id, sc.text_zh);
                }
            }
            zhMap.set(sq.id, {
                stemZh: sq.stem_zh,
                analysisZh: sq.analysis_zh,
                choicesZh,
            });
        }

        // 读取并更新 topic 文件
        const topicData: TopicFile = JSON.parse(
            fs.readFileSync(topicPath, "utf-8")
        );
        let synced = 0;

        for (const tq of topicData.questions) {
            const zh = zhMap.get(tq.id);
            if (!zh) continue;

            if (zh.stemZh) tq.stemZh = zh.stemZh;
            if (zh.analysisZh) tq.analysisZh = zh.analysisZh;

            for (const tc of tq.choices) {
                const textZh = zh.choicesZh.get(tc.id);
                if (textZh) tc.textZh = textZh;
            }

            synced++;
        }

        // 写回
        fs.writeFileSync(topicPath, JSON.stringify(topicData, null, 2) + "\n");
        console.log(`✅ ${slug}: 同步了 ${synced}/${topicData.questions.length} 题的中文翻译`);
        totalSynced += synced;
    }

    console.log(`\n🎉 总计同步: ${totalSynced} 题`);
}

main();
