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

export async function latestDocuments(db: Kysely<DiariumDatabase>): Promise<
  {
    documentId: string;
    documentDate: string;
    documentType: string;
    caseName: string;
    companyId?: string;
    companyName?: string;
    created: string;
  }[]
> {
  const result = await db
    .selectFrom("documents")
    .select([
      "documentId",
      "documentDate",
      "documentType",
      "caseName",
      "companyId",
      "companyName",
      "created",
    ])
    .orderBy("created", "desc")
    .limit(8192)
    .execute();
  const documents = result.map((row) => ({
    documentId: row.documentId!,
    documentDate: row.documentDate!,
    documentType: row.documentType!,
    caseName: row.caseName!,
    companyId: row.companyId,
    companyName: row.companyName,
    created: `${row.created}`,
  }));
  return documents;
}

export async function countDocumentsByOrigin(
  db: Kysely<DiariumDatabase>,
): Promise<{ label: string; value: number }[]> {
  const result = await db
    .selectFrom("documents")
    .select(["documentOrigin", db.fn.count("documentId").as("documentCount")])
    .groupBy("documentOrigin")
    .orderBy("documentCount", "desc")
    .execute();
  return result.map((row) => ({
    label: row.documentOrigin!,
    value: Number(row.documentCount),
  }));
}

const handlingTimeBuckets = [
  "≤ 1 vecka",
  "≤ 1 månad",
  "≤ 3 månader",
  "≤ 6 månader",
  "> 6 månader",
];

export async function countCaseHandlingTime(
  db: Kysely<DiariumDatabase>,
): Promise<{ label: string; value: number }[]> {
  const result = await sql<{ bucket: string; caseCount: number }>`
    WITH span AS (
      SELECT
        caseId,
        julianday(MAX(documentDate)) - julianday(MIN(documentDate)) AS days
      FROM documents
      GROUP BY caseId
      HAVING COUNT(*) > 1
    )
    SELECT
      CASE
        WHEN days <= 7 THEN '≤ 1 vecka'
        WHEN days <= 30 THEN '≤ 1 månad'
        WHEN days <= 90 THEN '≤ 3 månader'
        WHEN days <= 180 THEN '≤ 6 månader'
        ELSE '> 6 månader'
      END AS bucket,
      COUNT(*) AS caseCount
    FROM span
    GROUP BY bucket
  `.execute(db);
  return result.rows
    .map((row) => ({ label: row.bucket, value: Number(row.caseCount) }))
    .sort(
      (a, b) =>
        handlingTimeBuckets.indexOf(a.label) -
        handlingTimeBuckets.indexOf(b.label),
    );
}

export async function countSingleDocumentCaseShare(
  db: Kysely<DiariumDatabase>,
): Promise<{ singleDocumentCases: number; totalCases: number; percent: number }> {
  const result = await sql<{ singleDocumentCases: number; totalCases: number }>`
    SELECT
      SUM(CASE WHEN n = 1 THEN 1 ELSE 0 END) AS singleDocumentCases,
      COUNT(*) AS totalCases
    FROM (SELECT caseId, COUNT(*) AS n FROM documents GROUP BY caseId)
  `.execute(db);
  const row = result.rows[0];
  const singleDocumentCases = Number(row.singleDocumentCases);
  const totalCases = Number(row.totalCases);
  return {
    singleDocumentCases,
    totalCases,
    percent: Math.round((singleDocumentCases / totalCases) * 100),
  };
}

export async function countDocumentsByOriginPerDay(
  db: Kysely<DiariumDatabase>,
): Promise<
  { date: string; Inkommande: number; Utgående: number; Upprättad: number }[]
> {
  const days = listDaysInYear(`${process.env.NEXT_PUBLIC_YEAR}`);
  const rows = await db
    .selectFrom("documents")
    .select([
      "documentDate",
      sql<number>`SUM(CASE WHEN documentOrigin = 'Inkommande' THEN 1 ELSE 0 END)`.as(
        "inkommande",
      ),
      sql<number>`SUM(CASE WHEN documentOrigin = 'Utgående' THEN 1 ELSE 0 END)`.as(
        "utgaende",
      ),
      sql<number>`SUM(CASE WHEN documentOrigin = 'Upprättad' THEN 1 ELSE 0 END)`.as(
        "upprattad",
      ),
    ])
    .groupBy("documentDate")
    .orderBy("documentDate")
    .execute();
  return days.map((day) => {
    const row = rows.find((r) => r.documentDate === day);
    return {
      date: day,
      Inkommande: Number(row?.inkommande ?? 0),
      Utgående: Number(row?.utgaende ?? 0),
      Upprättad: Number(row?.upprattad ?? 0),
    };
  });
}

export async function countDocumentsByOriginPerWeek(
  db: Kysely<DiariumDatabase>,
): Promise<
  { date: string; Inkommande: number; Utgående: number; Upprättad: number }[]
> {
  const days = await countDocumentsByOriginPerDay(db);
  const weeks = new Map<
    string,
    { date: string; Inkommande: number; Utgående: number; Upprättad: number }
  >();
  for (const day of days) {
    const date = new Date(`${day.date}T00:00:00Z`);
    const weekday = (date.getUTCDay() + 6) % 7; // Monday = 0
    date.setUTCDate(date.getUTCDate() - weekday);
    const key = date.toISOString().slice(0, 10);
    const week = weeks.get(key) ?? {
      date: key,
      Inkommande: 0,
      Utgående: 0,
      Upprättad: 0,
    };
    week.Inkommande += day.Inkommande;
    week.Utgående += day.Utgående;
    week.Upprättad += day.Upprättad;
    weeks.set(key, week);
  }
  return Array.from(weeks.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export async function countHandlingTimeBySubject(
  db: Kysely<DiariumDatabase>,
): Promise<{ label: string; value: number }[]> {
  const result = await sql<{ caseSubject: string; avgDays: number }>`
    WITH span AS (
      SELECT
        caseId,
        caseSubject,
        julianday(MAX(documentDate)) - julianday(MIN(documentDate)) AS days
      FROM documents
      GROUP BY caseId
      HAVING COUNT(*) > 1
    )
    SELECT caseSubject, AVG(days) AS avgDays
    FROM span
    WHERE caseSubject IS NOT NULL AND caseSubject != ''
    GROUP BY caseSubject
    ORDER BY avgDays DESC
  `.execute(db);
  return result.rows.map((row) => ({
    label: row.caseSubject,
    value: Math.round(Number(row.avgDays)),
  }));
}

export async function countHandlingTimeByCounty(
  db: Kysely<DiariumDatabase>,
): Promise<{ label: string; value: number }[]> {
  const result = await sql<{ countyName: string; avgDays: number }>`
    WITH caseCounty AS (
      SELECT caseId, countyName FROM documents GROUP BY caseId
    ),
    span AS (
      SELECT
        caseId,
        julianday(MAX(documentDate)) - julianday(MIN(documentDate)) AS days
      FROM documents
      GROUP BY caseId
      HAVING COUNT(*) > 1
    )
    SELECT c.countyName, AVG(s.days) AS avgDays
    FROM span s
    JOIN caseCounty c ON c.caseId = s.caseId
    WHERE c.countyName IS NOT NULL AND c.countyName != ''
      AND c.countyName NOT LIKE '%FIKTIV%'
    GROUP BY c.countyName
    ORDER BY avgDays DESC
  `.execute(db);
  return result.rows.map((row) => ({
    label: row.countyName
      .replace(/\s*LÄN$/i, "")
      .toLowerCase()
      .replace(/^\p{L}/u, (c) => c.toUpperCase()),
    value: Math.round(Number(row.avgDays)),
  }));
}
