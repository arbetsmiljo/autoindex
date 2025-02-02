import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@arbetsmarknad/components/Breadcrumb";
import { Container } from "@arbetsmarknad/components/Container";
import { HeaderMenu } from "@arbetsmarknad/components/HeaderMenu";
import { Page } from "@arbetsmarknad/components/Page";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
import sqlite3 from "sqlite3";
import { DocumentsPerDayChart } from "../components/DocumentsPerDayChart";
import { AsbestosPieChart } from "@/components/AsbestosPieChart";

async function countTotalDocuments(
  database: sqlite3.Database,
): Promise<number> {
  return new Promise((resolve, reject) => {
    database.get(
      `SELECT COUNT(*) as documentCount FROM documents`,
      (error: Error, row: { documentCount: string }) => {
        if (error) {
          reject(error);
        } else {
          resolve(parseInt(row.documentCount));
        }
      },
    );
  });
}

async function countDocumentsPerDay(
  database: sqlite3.Database,
): Promise<{ date: string; documentCount: number }[]> {
  return new Promise((resolve, reject) => {
    database.all(
      `SELECT documentDate, COUNT(*) as documentCount FROM documents GROUP BY documentDate ORDER BY documentDate`,
      (
        error: Error,
        rows: { documentDate: string; documentCount: string }[],
      ) => {
        if (error) {
          reject(error);
        } else {
          const output: { date: string; documentCount: number }[] = [];
          rows.forEach((row) => {
            output.push({
              date: row.documentDate,
              documentCount: parseInt(row.documentCount),
            });
          });
          resolve(output);
        }
      },
    );
  });
}

async function countAsbestosTotals(database: sqlite3.Database): Promise<{
  asbestosDocumentTotal: number;
  nonAsbestosDocumentTotal: number;
}> {
  return new Promise((resolve, reject) => {
    database.get(
      `SELECT
          SUM(CASE WHEN caseName LIKE '%asbest%' THEN 1 ELSE 0 END) AS asbestosDocumentTotal,
          SUM(CASE WHEN caseName NOT LIKE '%asbest%' THEN 1 ELSE 0 END) AS nonAsbestosDocumentTotal
      FROM documents;`,
      (
        error: Error,
        rows: {
          asbestosDocumentTotal: string;
          nonAsbestosDocumentTotal: string;
        },
      ) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            asbestosDocumentTotal: parseInt(rows.asbestosDocumentTotal),
            nonAsbestosDocumentTotal: parseInt(rows.nonAsbestosDocumentTotal),
          });
        }
      },
    );
  });
}

export default async function Home() {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const database = new sqlite3.Database(databasePath);

  const totalDocuments = await countTotalDocuments(database);
  const documentsPerDay = await countDocumentsPerDay(database);
  const asbestosTotals = await countAsbestosTotals(database);

  return (
    <Page>
      <HeaderMenu
        href="https://arbetsmiljo.github.io"
        text="arbetsmiljo.github.io"
      />
      <Breadcrumb className="py-4 w-full flex justify-center">
        <Container>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Arbetsmiljö</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${process.env.NEXT_PUBLIC_YEAR}`}>
                {process.env.NEXT_PUBLIC_YEAR}`
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Container>
      </Breadcrumb>
      <main className="flex flex-col items-center w-full py-4">
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading
            text={`Arbetsmiljö ${process.env.NEXT_PUBLIC_YEAR}`}
          />
          <DocumentsPerDayChart
            totalDocuments={totalDocuments}
            documentsPerDay={documentsPerDay}
          />
          <AsbestosPieChart
            title="Asbesthandlingar"
            description="Andelen handlingar som innehåller ordet 'asbest'"
            numerator={asbestosTotals.asbestosDocumentTotal}
            denominator={totalDocuments}
          />
        </Container>
      </main>
    </Page>
  );
}
