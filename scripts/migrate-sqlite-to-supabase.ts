import "dotenv/config";

import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const SQLITE_URL = process.env.SQLITE_URL ?? "file:dev.db";
const PG_URL = process.env.DATABASE_URL;

if (!PG_URL) {
  throw new Error("缺少 DATABASE_URL，请先配置 .env");
}

const sqlite = createClient({ url: SQLITE_URL });
const pool = new Pool({ connectionString: PG_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type TableName =
  | "Category"
  | "Question"
  | "Choice"
  | "User"
  | "Session"
  | "UserMistake"
  | "UserTopicProgress"
  | "UserBookmark";

type SQLiteCounts = Record<TableName, number>;

type CategoryRow = { id: string; title: string };
type QuestionRow = {
  id: string;
  type: string;
  stem: string;
  stemZh: string | null;
  analysis: string;
  analysisZh: string | null;
  difficulty: number;
  tags: string | null;
  categoryId: string;
};
type ChoiceRow = {
  id: string;
  originalId: string;
  text: string;
  textZh: string | null;
  isCorrect: number | boolean;
  questionId: string;
};
type UserRow = {
  id: string;
  account: string;
  passwordHash: string;
  nickname: string;
  role: string;
  plan: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
type SessionRow = {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
};
type UserMistakeRow = {
  id: string;
  userId: string;
  questionId: string;
  questionJson: string;
  topicId: string;
  count: number;
  lastWrongAt: string;
  createdAt: string;
  updatedAt: string;
};
type UserTopicProgressRow = {
  id: string;
  userId: string;
  topicId: string;
  totalAnswered: number;
  correctCount: number;
  lastPracticeAt: string;
  createdAt: string;
  updatedAt: string;
};
type UserBookmarkRow = {
  id: string;
  userId: string;
  questionId: string;
  questionJson: string;
  topicId: string;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
};

function asBool(value: number | boolean): boolean {
  if (typeof value === "boolean") return value;
  return value === 1;
}

function asDate(value: string): Date {
  return new Date(value);
}

async function querySQLite<T>(sql: string): Promise<T[]> {
  const result = await sqlite.execute(sql);
  return result.rows as unknown as T[];
}

async function getSQLiteCounts(): Promise<SQLiteCounts> {
  const sql = `
    SELECT 'Category' AS name, COUNT(*) AS count FROM Category
    UNION ALL SELECT 'Question', COUNT(*) FROM Question
    UNION ALL SELECT 'Choice', COUNT(*) FROM Choice
    UNION ALL SELECT 'User', COUNT(*) FROM User
    UNION ALL SELECT 'Session', COUNT(*) FROM Session
    UNION ALL SELECT 'UserMistake', COUNT(*) FROM UserMistake
    UNION ALL SELECT 'UserTopicProgress', COUNT(*) FROM UserTopicProgress
    UNION ALL SELECT 'UserBookmark', COUNT(*) FROM UserBookmark
  `;
  const rows = await querySQLite<{ name: TableName; count: number }>(sql);

  const counts: SQLiteCounts = {
    Category: 0,
    Question: 0,
    Choice: 0,
    User: 0,
    Session: 0,
    UserMistake: 0,
    UserTopicProgress: 0,
    UserBookmark: 0,
  };

  for (const row of rows) {
    counts[row.name] = Number(row.count);
  }

  return counts;
}

async function getPGCounts() {
  const [category, question, choice, user, session, userMistake, userTopicProgress, userBookmark] =
    await Promise.all([
      prisma.category.count(),
      prisma.question.count(),
      prisma.choice.count(),
      prisma.user.count(),
      prisma.session.count(),
      prisma.userMistake.count(),
      prisma.userTopicProgress.count(),
      prisma.userBookmark.count(),
    ]);

  return {
    Category: category,
    Question: question,
    Choice: choice,
    User: user,
    Session: session,
    UserMistake: userMistake,
    UserTopicProgress: userTopicProgress,
    UserBookmark: userBookmark,
  };
}

function printCounts(title: string, counts: Record<TableName, number>) {
  console.log(`\n${title}`);
  for (const [table, count] of Object.entries(counts)) {
    console.log(`- ${table}: ${count}`);
  }
}

async function migrateCategories() {
  const rows = await querySQLite<CategoryRow>('SELECT id, title FROM "Category"');
  for (const row of rows) {
    await prisma.category.upsert({
      where: { id: row.id },
      update: { title: row.title },
      create: { id: row.id, title: row.title },
    });
  }
}

async function migrateQuestions() {
  const rows = await querySQLite<QuestionRow>(
    'SELECT id, type, stem, stemZh, analysis, analysisZh, difficulty, tags, categoryId FROM "Question"',
  );
  for (const row of rows) {
    await prisma.question.upsert({
      where: { id: row.id },
      update: {
        type: row.type,
        stem: row.stem,
        stemZh: row.stemZh,
        analysis: row.analysis,
        analysisZh: row.analysisZh,
        difficulty: Number(row.difficulty),
        tags: row.tags,
        categoryId: row.categoryId,
      },
      create: {
        id: row.id,
        type: row.type,
        stem: row.stem,
        stemZh: row.stemZh,
        analysis: row.analysis,
        analysisZh: row.analysisZh,
        difficulty: Number(row.difficulty),
        tags: row.tags,
        categoryId: row.categoryId,
      },
    });
  }
}

async function migrateChoices() {
  const rows = await querySQLite<ChoiceRow>(
    'SELECT id, originalId, text, textZh, isCorrect, questionId FROM "Choice"',
  );
  for (const row of rows) {
    await prisma.choice.upsert({
      where: { id: row.id },
      update: {
        originalId: row.originalId,
        text: row.text,
        textZh: row.textZh,
        isCorrect: asBool(row.isCorrect),
        questionId: row.questionId,
      },
      create: {
        id: row.id,
        originalId: row.originalId,
        text: row.text,
        textZh: row.textZh,
        isCorrect: asBool(row.isCorrect),
        questionId: row.questionId,
      },
    });
  }
}

async function migrateUsers() {
  const rows = await querySQLite<UserRow>(
    'SELECT id, account, passwordHash, nickname, role, plan, status, createdAt, updatedAt FROM "User"',
  );
  for (const row of rows) {
    await prisma.user.upsert({
      where: { id: row.id },
      update: {
        account: row.account,
        passwordHash: row.passwordHash,
        nickname: row.nickname,
        role: row.role,
        plan: row.plan,
        status: row.status,
        createdAt: asDate(row.createdAt),
      },
      create: {
        id: row.id,
        account: row.account,
        passwordHash: row.passwordHash,
        nickname: row.nickname,
        role: row.role,
        plan: row.plan,
        status: row.status,
        createdAt: asDate(row.createdAt),
      },
    });
  }
}

async function migrateSessions() {
  const rows = await querySQLite<SessionRow>(
    'SELECT id, tokenHash, userId, expiresAt, createdAt FROM "Session"',
  );
  for (const row of rows) {
    await prisma.session.upsert({
      where: { id: row.id },
      update: {
        tokenHash: row.tokenHash,
        userId: row.userId,
        expiresAt: asDate(row.expiresAt),
        createdAt: asDate(row.createdAt),
      },
      create: {
        id: row.id,
        tokenHash: row.tokenHash,
        userId: row.userId,
        expiresAt: asDate(row.expiresAt),
        createdAt: asDate(row.createdAt),
      },
    });
  }
}

async function migrateUserMistakes() {
  const rows = await querySQLite<UserMistakeRow>(
    'SELECT id, userId, questionId, questionJson, topicId, count, lastWrongAt, createdAt, updatedAt FROM "UserMistake"',
  );
  for (const row of rows) {
    await prisma.userMistake.upsert({
      where: {
        userId_questionId: {
          userId: row.userId,
          questionId: row.questionId,
        },
      },
      update: {
        questionJson: row.questionJson,
        topicId: row.topicId,
        count: Number(row.count),
        lastWrongAt: asDate(row.lastWrongAt),
        createdAt: asDate(row.createdAt),
        updatedAt: asDate(row.updatedAt),
      },
      create: {
        id: row.id,
        userId: row.userId,
        questionId: row.questionId,
        questionJson: row.questionJson,
        topicId: row.topicId,
        count: Number(row.count),
        lastWrongAt: asDate(row.lastWrongAt),
        createdAt: asDate(row.createdAt),
        updatedAt: asDate(row.updatedAt),
      },
    });
  }
}

async function migrateUserTopicProgresses() {
  const rows = await querySQLite<UserTopicProgressRow>(
    'SELECT id, userId, topicId, totalAnswered, correctCount, lastPracticeAt, createdAt, updatedAt FROM "UserTopicProgress"',
  );
  for (const row of rows) {
    await prisma.userTopicProgress.upsert({
      where: {
        userId_topicId: {
          userId: row.userId,
          topicId: row.topicId,
        },
      },
      update: {
        totalAnswered: Number(row.totalAnswered),
        correctCount: Number(row.correctCount),
        lastPracticeAt: asDate(row.lastPracticeAt),
        createdAt: asDate(row.createdAt),
        updatedAt: asDate(row.updatedAt),
      },
      create: {
        id: row.id,
        userId: row.userId,
        topicId: row.topicId,
        totalAnswered: Number(row.totalAnswered),
        correctCount: Number(row.correctCount),
        lastPracticeAt: asDate(row.lastPracticeAt),
        createdAt: asDate(row.createdAt),
        updatedAt: asDate(row.updatedAt),
      },
    });
  }
}

async function migrateUserBookmarks() {
  const rows = await querySQLite<UserBookmarkRow>(
    'SELECT id, userId, questionId, questionJson, topicId, addedAt, createdAt, updatedAt FROM "UserBookmark"',
  );
  for (const row of rows) {
    await prisma.userBookmark.upsert({
      where: {
        userId_questionId: {
          userId: row.userId,
          questionId: row.questionId,
        },
      },
      update: {
        questionJson: row.questionJson,
        topicId: row.topicId,
        addedAt: asDate(row.addedAt),
        createdAt: asDate(row.createdAt),
        updatedAt: asDate(row.updatedAt),
      },
      create: {
        id: row.id,
        userId: row.userId,
        questionId: row.questionId,
        questionJson: row.questionJson,
        topicId: row.topicId,
        addedAt: asDate(row.addedAt),
        createdAt: asDate(row.createdAt),
        updatedAt: asDate(row.updatedAt),
      },
    });
  }
}

async function main() {
  console.log("开始迁移 SQLite -> Supabase(Postgres)...");
  console.log(`SQLite 源: ${SQLITE_URL}`);

  const sourceBefore = await getSQLiteCounts();
  const targetBefore = await getPGCounts();

  printCounts("源库计数", sourceBefore);
  printCounts("目标库迁移前计数", targetBefore);

  await migrateCategories();
  await migrateQuestions();
  await migrateChoices();
  await migrateUsers();
  await migrateSessions();
  await migrateUserMistakes();
  await migrateUserTopicProgresses();
  await migrateUserBookmarks();

  const targetAfter = await getPGCounts();
  printCounts("目标库迁移后计数", targetAfter);

  console.log("\n迁移完成。可重复执行（upsert 幂等）。");
}

main()
  .catch((error) => {
    console.error("迁移失败:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    sqlite.close();
  });
