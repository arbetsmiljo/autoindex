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
import { DocumentsPerDayChart } from "@/components/DocumentsPerDayChart";
import { PercentagePieChart } from "@/components/PercentagePieChart";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Arbetsmiljöinspektioner ${process.env.NEXT_PUBLIC_YEAR}`,
  };
}

async function countCasesPerDay(
  database: sqlite3.Database,
): Promise<{ date: string; documentCount: number }[]> {
  return new Promise((resolve, reject) => {
    database.all(
      `SELECT documentDate, COUNT(*) as documentCount FROM documents WHERE caseName LIKE '%inspektion%' AND documentId LIKE '%-1' GROUP BY documentDate ORDER BY documentDate`,
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

export default async function Inspections() {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const database = new sqlite3.Database(databasePath);

  const casesPerDay = await countCasesPerDay(database);

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
              <BreadcrumbLink href="https://arbetsmarknad.github.io/">
                Arbetsmarknad
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Arbetsmiljö</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${process.env.NEXT_PUBLIC_YEAR}`}>
                {process.env.NEXT_PUBLIC_YEAR}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/${process.env.NEXT_PUBLIC_YEAR}/inspektioner`}
              >
                Inspektioner
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Container>
      </Breadcrumb>
      <main className="flex flex-col items-center w-full py-4">
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading
            text={`Arbetsmiljöinspektioner ${process.env.NEXT_PUBLIC_YEAR}`}
          />
          <DocumentsPerDayChart
            totalDocuments={casesPerDay.reduce(
              (acc, { documentCount }) => acc + documentCount,
              0,
            )}
            documentsPerDay={casesPerDay}
          />
        </Container>
      </main>
    </Page>
  );
}
