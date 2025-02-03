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
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Asbest ${process.env.NEXT_PUBLIC_YEAR}`,
  };
}

async function countCasesPerDay(
  database: sqlite3.Database,
): Promise<{ date: string; value: number }[]> {
  return new Promise((resolve, reject) => {
    database.all(
      `SELECT documentDate, COUNT(*) as documentCount FROM documents WHERE caseName LIKE '%asbest%' AND documentId LIKE '%-1' GROUP BY documentDate ORDER BY documentDate`,
      (
        error: Error,
        rows: { documentDate: string; documentCount: string }[],
      ) => {
        if (error) {
          reject(error);
        } else {
          const output: { date: string; value: number }[] = [];
          rows.forEach((row) => {
            output.push({
              date: row.documentDate,
              value: parseInt(row.documentCount),
            });
          });
          resolve(output);
        }
      },
    );
  });
}

export default async function Asbestos() {
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
              <BreadcrumbLink href={`/${process.env.NEXT_PUBLIC_YEAR}/asbest`}>
                Asbest
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Container>
      </Breadcrumb>
      <main className="flex flex-col items-center w-full py-4">
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading text={`Asbest ${process.env.NEXT_PUBLIC_YEAR}`} />
          <DateRangeBarChart
            title="Ärenden per dag"
            description="Antal nya ärenden som innehåller ordet 'asbest' per dag"
            data={casesPerDay}
            valueLabel="Ärenden"
          />
        </Container>
      </main>
    </Page>
  );
}
