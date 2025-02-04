import _ from "lodash";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@arbetsmarknad/components/Breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@arbetsmarknad/components/Card";
import { Container } from "@arbetsmarknad/components/Container";
import { HeaderMenu } from "@arbetsmarknad/components/HeaderMenu";
import { Page } from "@arbetsmarknad/components/Page";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
import sqlite3 from "sqlite3";
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
import { PercentagePieChart } from "@/components/PercentagePieChart";
import { Metadata } from "next";
import {
  initKysely,
  countTotalDocuments,
  countDocumentsPerDay,
  countCaseNameKeywordMatches,
  selectDistinctCounties,
} from "@/lib/database";
import { slugify } from "@/lib/slugify";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Arbetsmiljö ${process.env.NEXT_PUBLIC_YEAR}`,
  };
}

export default async function Home() {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);
  const sqlite = new sqlite3.Database(databasePath);

  const totalDocuments = await countTotalDocuments(db);
  const documentsPerDay = await countDocumentsPerDay(db);
  const keywordMatches = await countCaseNameKeywordMatches(sqlite, [
    "asbest",
    "inspektion",
  ]);
  const counties = await selectDistinctCounties(db);

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
          </BreadcrumbList>
        </Container>
      </Breadcrumb>
      <main className="flex flex-col items-center w-full py-4">
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading
            text={`Arbetsmiljö ${process.env.NEXT_PUBLIC_YEAR}`}
          />

          <DateRangeBarChart
            title="Handlingar per dag"
            description="Visar antalet handlingar per dag genom året."
            data={documentsPerDay}
            valueLabel="Handlingar"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <PercentagePieChart
              title="Inspektionshandlingar"
              href={`/${process.env.NEXT_PUBLIC_YEAR}/inspektioner`}
              description="Andelen handlingar som innehåller ordet 'inspektion'"
              numerator={keywordMatches.inspektion}
              denominator={totalDocuments}
              numeratorLabel="Inspektion"
              complementLabel="Icke-inspektion"
              percentSuffix="Inspektioner"
              footer={
                <>
                  Av totalt {totalDocuments} handlingar är{" "}
                  {keywordMatches.inspektion} p.g.a. inspektioner.
                </>
              }
            />

            <PercentagePieChart
              title="Asbesthandlingar"
              href={`/${process.env.NEXT_PUBLIC_YEAR}/asbest`}
              description="Andelen handlingar som innehåller ordet 'asbest'"
              numerator={keywordMatches.asbest}
              denominator={totalDocuments}
              numeratorLabel="Asbest"
              complementLabel="Icke-asbest"
              percentSuffix="Asbest"
              footer={
                <>
                  Av totalt {totalDocuments} handlingar är{" "}
                  {keywordMatches.asbest} p.g.a. asbest.
                </>
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>Län</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <ul className="flex flex-col gap-2">
                  {counties.map((county) => (
                    <li key={county.countyId}>
                      <a
                        className="underline text-blue-600"
                        href={`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(county.countyName)}`}
                      >
                        {_.capitalize(county.countyName)}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
    </Page>
  );
}
