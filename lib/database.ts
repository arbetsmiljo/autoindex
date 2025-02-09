import Database from "better-sqlite3";
import { Generated, Kysely, SelectQueryBuilder, SqliteDialect } from "kysely";
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

export async function countCasesPerDay(
  db: Kysely<DiariumDatabase>,
  where?: (
    q: SelectQueryBuilder<DiariumDatabase, any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => SelectQueryBuilder<DiariumDatabase, any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<{ date: string; value: number }[]> {
  const days = listDaysInYear(`${process.env.NEXT_PUBLIC_YEAR}`);
  let query = db
    .selectFrom("documents")
    .select(["documentDate", db.fn.count("documentId").as("documentCount")])
    .groupBy("documentDate")
    .orderBy("documentDate");
  if (where) query = where(query);
  const result = await query.execute();
  return days.map((day) => ({
    date: day,
    value:
      Number(result.find((row) => row.documentDate === day)?.documentCount) ||
      0,
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
  where?: (
    q: SelectQueryBuilder<DiariumDatabase, any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => SelectQueryBuilder<DiariumDatabase, any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<{ date: string; value: number }[]> {
  const days = listDaysInYear(`${process.env.NEXT_PUBLIC_YEAR}`);
  let query = db
    .selectFrom("documents")
    .select(["documentDate", db.fn.count("documentId").as("value")]);
  if (where) query = where(query);
  const rows = await query
    .groupBy("documentDate")
    .orderBy("documentDate")
    .execute();
  return days.map((day) => ({
    date: day,
    value: Number(rows.find((row) => row.documentDate === day)?.value) || 0,
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

type County = {
  countyId: string;
  countyName: string;
};

export async function selectDistinctCounties(
  db: Kysely<DiariumDatabase>,
): Promise<County[]> {
  const result = await db
    .selectFrom("documents")
    .select(["countyId", "countyName"])
    .where("countyId", "is not", null)
    .where("countyName", "is not", null)
    .orderBy("countyName")
    .distinct()
    .execute();
  const counties = result.map((row) => ({
    countyId: row.countyId!,
    countyName: row.countyName!,
  }));
  return counties;
}

type Municipality = {
  municipalityId: string;
  municipalityName: string;
};

export async function selectDistinctCountiesAndMunicipalities(
  db: Kysely<DiariumDatabase>,
  where?: (
    q: SelectQueryBuilder<DiariumDatabase, any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => SelectQueryBuilder<DiariumDatabase, any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<[County, Municipality][]> {
  let query = db
    .selectFrom("documents")
    .select(["countyId", "countyName", "municipalityId", "municipalityName"])
    .where("countyId", "is not", null)
    .where("countyName", "is not", null)
    .where("municipalityId", "is not", null)
    .where("municipalityName", "is not", null);
  if (where) query = where(query);
  query = query.orderBy("countyName").distinct();
  const result = await query.execute();
  const output = result.map(
    (row) =>
      [
        {
          countyId: row.countyId!,
          countyName: row.countyName!,
        },
        {
          municipalityId: row.municipalityId!,
          municipalityName: row.municipalityName!,
        },
      ] as [County, Municipality],
  );
  return output;
}

export async function countDocumentsByCounty(
  db: Kysely<DiariumDatabase>,
): Promise<{ countyName: string; documentCount: number }[]> {
  const result = await db
    .selectFrom("documents")
    .select(["countyName", db.fn.count("documentId").as("documentCount")])
    .where("countyName", "is not", null)
    .groupBy("countyName")
    .orderBy("documentCount", "desc")
    .execute();
  return result.map((row) => ({
    countyName: row.countyName!,
    documentCount: Number(row.documentCount),
  }));
}

export async function countDocumentsByMunicipality(
  db: Kysely<DiariumDatabase>,
  countyName: string,
): Promise<{ municipalityName: string; documentCount: number }[]> {
  const result = await db
    .selectFrom("documents")
    .select(["municipalityName", db.fn.count("documentId").as("documentCount")])
    .where("municipalityName", "is not", null)
    .where("countyName", "=", countyName)
    .groupBy("municipalityName")
    .orderBy("documentCount", "desc")
    .execute();
  return result.map((row) => ({
    municipalityName: row.municipalityName!,
    documentCount: Number(row.documentCount),
  }));
}

import { sql } from "kysely";
import { listDaysInYear } from "./time";

export async function countDocumentsByInspectionType(
  db: Kysely<DiariumDatabase>,
): Promise<{ inspectionType: string; count: number }[]> {
  const result = await db
    .selectFrom("documents")
    .select([
      sql<string>`TRIM(REPLACE(caseName, 'Inspektion inom', ''))`.as(
        "inspectionType",
      ),
      db.fn.countAll().as("count"),
    ])
    .where("caseName", "like", "Inspektion inom%")
    .groupBy("inspectionType")
    .orderBy("count", "desc")
    .execute();

  return result.map((row) => ({
    inspectionType: row.inspectionType!,
    count: Number(row.count),
  }));
}

export async function countDocumentsByCompanyNameKeyword(
  db: Kysely<DiariumDatabase>,
  keyword: string,
): Promise<{ companyName: string; documentCount: number }[]> {
  const result = await db
    .selectFrom("documents")
    .select(["companyName", db.fn.count("documentId").as("documentCount")])
    .where("caseName", "like", `%${keyword}%`)
    .where("companyName", "is not", null)
    .groupBy("companyName")
    .orderBy("documentCount", "desc")
    .execute();
  return result.map((row) => ({
    companyName: row.companyName!,
    documentCount: Number(row.documentCount),
  }));
}

export async function countDocumentsByMunicipalityNameKeyword(
  db: Kysely<DiariumDatabase>,
  keyword: string,
): Promise<
  { municipalityName: string; countyName: string; documentCount: number }[]
> {
  const result = await db
    .selectFrom("documents")
    .select([
      "municipalityName",
      "countyName",
      db.fn.count("documentId").as("documentCount"),
    ])
    .where("caseName", "like", `%${keyword}%`)
    .where("municipalityName", "is not", null)
    .groupBy("municipalityName")
    .orderBy("documentCount", "desc")
    .execute();
  return result.map((row) => ({
    municipalityName: row.municipalityName!,
    countyName: row.countyName!,
    documentCount: Number(row.documentCount),
  }));
}

export async function countCasesPerSeason(
  db: Kysely<DiariumDatabase>,
  keyword: string,
): Promise<{ season: string; count: number }[]> {
  const result = await db
    .selectFrom("documents")
    .select([
      sql<string>`CASE
        WHEN strftime('%m', documentDate) IN ('03', '04', '05') THEN 'spring'
        WHEN strftime('%m', documentDate) IN ('06', '07', '08') THEN 'summer'
        WHEN strftime('%m', documentDate) IN ('09', '10', '11') THEN 'autumn'
        ELSE 'winter'
      END`.as("season"),
      db.fn.count("documentId").as("count"),
    ])
    .where("caseName", "like", `%${keyword}%`)
    .groupBy("season")
    .orderBy(
      sql<number>`CASE
        WHEN season = 'spring' THEN 1
        WHEN season = 'summer' THEN 2
        WHEN season = 'autumn' THEN 3
        ELSE 4
      END`,
    )
    .execute();
  return result.map((row) => ({
    season: row.season!,
    count: Number(row.count),
  }));
}
