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
import { Chart } from "../components/Chart";

async function countDocuments(database: sqlite3.Database): Promise<number> {
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
): Promise<Record<string, number>> {
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
          const documentCountPerDay: { [key: string]: number } = {};
          rows.forEach((row) => {
            documentCountPerDay[row.documentDate] = parseInt(row.documentCount);
          });
          resolve(documentCountPerDay);
        }
      },
    );
  });
}

export default async function Home() {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const database = new sqlite3.Database(databasePath);
  const documentCount = await countDocuments(database);
  const documentCountPerDay = await countDocumentsPerDay(database);

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
          <p>Testing</p>
          <p>{`Document count: ${documentCount}`}</p>
          <Chart
            data={{
              labels: Object.keys(documentCountPerDay),
              datasets: [
                {
                  label: "Documents",
                  data: Object.values(documentCountPerDay),
                  backgroundColor: "rgba(255, 99, 132, 0.5)",
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: false,
                  position: "top",
                },
              },
              title: {
                display: true,
                text: "Documents per day",
              },
            }}
          />
        </Container>
      </main>
    </Page>
  );
}
