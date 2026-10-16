import _ from "lodash";
import { Breadcrumbs } from "@arbetsmarknad/components/Breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@arbetsmarknad/components/Card";
import { Container } from "@arbetsmarknad/components/Container";
import { Main } from "@arbetsmarknad/components/Main";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
import sqlite3 from "sqlite3";
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
import { PercentagePieChart } from "@/components/PercentagePieChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@arbetsmarknad/components/Table";
import { Metadata } from "next";
import {
  initKysely,
  countTotalDocuments,
  countDocumentsPerDay,
  countCaseNameKeywordMatches,
  countDocumentsByCounty,
  countCasesPerSeason,
} from "@/lib/database";
import { slugify } from "@/lib/slugify";
import { SeasonBarChart } from "@/components/SeasonBarChart";

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
    "olycksfall",
  ]);
  const documentsByCounty = await countDocumentsByCounty(db);
  const accidentCasesPerSeason = await countCasesPerSeason(db, "olycksfall");

  return (
    <>
      <Breadcrumbs>
        {{
          "https://arbetsmarknad.github.io/": "Arbetsmarknad",
          "/": "Arbetsmiljö",
          [`/${process.env.NEXT_PUBLIC_YEAR}`]: `${process.env.NEXT_PUBLIC_YEAR}`,
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading
            text={`Arbetsmiljö ${process.env.NEXT_PUBLIC_YEAR}`}
          />

          <DateRangeBarChart
            title="Handlingar per dag"
            description="Antalet handlingar per dag genom året."
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
            />

            <SeasonBarChart
              title="Olycksfall"
              description="Antalet ärenden som innehåller ordet 'olycksfall' per säsong."
              data={accidentCasesPerSeason}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <Card className="flex flex-col gap-y-4 border-background-secondary">
              <CardHeader className="flex flex-row items-stretch space-y-0 border-background-secondary border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                  <CardTitle>
                    <a
                      href={`/${process.env.NEXT_PUBLIC_YEAR}/geografi`}
                      className="text-link underline"
                    >
                      Geografisk fördelning
                    </a>
                  </CardTitle>
                  <CardDescription>Antalet handlingar per län</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <Table className="text-base">
                  <TableHeader>
                    <TableRow className="border-background-secondary">
                      <TableHead className="font-bold px-0">Län</TableHead>
                      <TableHead className="font-bold px-0">
                        Handlingar
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsByCounty
                      .slice(0, 5)
                      .map(({ countyName, documentCount }) => (
                        <TableRow
                          key={countyName}
                          className="border-background-secondary"
                        >
                          <TableCell className="font-medium px-0">
                            <a
                              className="underline text-link"
                              href={`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(countyName)}`}
                            >
                              {_.capitalize(countyName)}
                            </a>
                          </TableCell>
                          <TableCell>{documentCount}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <PercentagePieChart
              title="Asbesthandlingar"
              href={`/${process.env.NEXT_PUBLIC_YEAR}/asbest`}
              description="Andelen handlingar som innehåller ordet 'asbest'"
              numerator={keywordMatches.asbest}
              denominator={totalDocuments}
              numeratorLabel="Asbest"
              complementLabel="Icke-asbest"
              percentSuffix="Asbest"
            />
          </div>
        </Container>
      </Main>
    </>
  );
}
