import Database from "better-sqlite3";
import { Generated, Kysely, SqliteDialect } from "kysely";
import sqlite3 from "sqlite3";

export type DiariumDocument = {
  documentId: string;
  documentDate: string;
  documentOrigin: string;
  documentType: string;
  caseId: string;
  caseName: string;
  caseSubject: string;
  companyId?: string;
  companyName?: string;
  workplaceId?: string;
  workplaceName?: string;
  countyId?: string;
  countyName?: string;
  municipalityId?: string;
  municipalityName?: string;
  created: Generated<Date>;
};

export interface DiariumDatabase {
  documents: DiariumDocument;
}

export function initKysely(filename: string): Kysely<DiariumDatabase> {
  const database = new Database(filename);
  const dialect = new SqliteDialect({ database });
  const db = new Kysely<DiariumDatabase>({ dialect });
  return db;
}

export async function countAsbestosCasesPerDay(
  db: Kysely<DiariumDatabase>,
): Promise<{ date: string; value: number }[]> {
  const rows = await db
    .selectFrom("documents")
    .select(["documentDate", db.fn.count("documentId").as("documentCount")])
    .where("caseName", "like", "%asbest%")
    .where("documentId", "like", "%-1")
    .groupBy("documentDate")
    .orderBy("documentDate")
    .execute();
  return rows.map((row) => ({
    date: row.documentDate,
    value: Number(row.documentCount),
  }));
}

export async function countInspectionCasesPerDay(
  db: Kysely<DiariumDatabase>,
): Promise<{ date: string; value: number }[]> {
  const rows = await db
    .selectFrom("documents")
    .select(["documentDate", db.fn.count("documentId").as("documentCount")])
    .where("caseName", "like", "%inspektion%")
    .where("documentId", "like", "%-1")
    .groupBy("documentDate")
    .orderBy("documentDate")
    .execute();
  return rows.map((row) => ({
    date: row.documentDate,
    value: Number(row.documentCount),
  }));
}

export async function countTotalDocuments(
  db: Kysely<DiariumDatabase>,
): Promise<number> {
  const result = await db
    .selectFrom("documents")
    .select([db.fn.count("documentId").as("documentCount")])
    .executeTakeFirst();
  return result ? Number(result.documentCount) : 0;
}

export async function countDocumentsPerDay(
  db: Kysely<DiariumDatabase>,
): Promise<{ date: string; value: number }[]> {
  const rows = await db
    .selectFrom("documents")
    .select(["documentDate", db.fn.count("documentId").as("value")])
    .groupBy("documentDate")
    .orderBy("documentDate")
    .execute();
  return rows.map((row) => ({
    date: row.documentDate,
    value: Number(row.value),
  }));
}

export async function countCaseNameKeywordMatches(
  database: sqlite3.Database,
  keywords: string[],
): Promise<Record<string, number>> {
  return new Promise((resolve, reject) => {
    const conditions = keywords
      .map(
        (keyword) =>
          `SUM(CASE WHEN caseName LIKE '%${keyword}%' THEN 1 ELSE 0 END) AS "${keyword}"`,
      )
      .join(", ");

    const query = `SELECT ${conditions} FROM documents;`;

    database.get(query, (error: Error, rows: Record<string, string>) => {
      if (error) {
        reject(error);
      } else {
        const result: Record<string, number> = {};
        for (const key in rows) {
          result[key] = parseInt(rows[key]) || 0;
        }
        resolve(result);
      }
    });
  });
}
