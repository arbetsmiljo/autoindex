import _ from "lodash";
import { Breadcrumbs } from "@arbetsmarknad/components/Breadcrumb";
import { Container } from "@arbetsmarknad/components/Container";
import { Main } from "@arbetsmarknad/components/Main";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
import { Metadata } from "next";
import {
  initKysely,
  countCasesPerDay,
  countDocumentsByCompanyNameKeyword,
  countDocumentsByMunicipalityNameKeyword,
} from "@/lib/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@arbetsmarknad/components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@arbetsmarknad/components/Table";
import { slugify } from "@/lib/slugify";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Asbest ${process.env.NEXT_PUBLIC_YEAR}`,
  };
}

export default async function Asbestos() {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);
  const asbestosCasesPerDay = await countCasesPerDay(db, (q) =>
    q.where("caseName", "like", "%asbest%").where("documentId", "like", "%-1"),
  );
  const asbestosCompanyRanking = await countDocumentsByCompanyNameKeyword(
    db,
    "asbest",
  );
  const asbestosMunicipalityRanking =
    await countDocumentsByMunicipalityNameKeyword(db, "asbest");

  return (
    <>
      <Breadcrumbs>
        {{
          "https://arbetsmarknad.github.io/": "Arbetsmarknad",
          "/": "Arbetsmiljö",
          [`/${process.env.NEXT_PUBLIC_YEAR}`]: `${process.env.NEXT_PUBLIC_YEAR}`,
          [`/${process.env.NEXT_PUBLIC_YEAR}/asbest`]: "Asbest",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading text={`Asbest ${process.env.NEXT_PUBLIC_YEAR}`} />
          <DateRangeBarChart
            title="Ärenden per dag"
            description="Antal nya ärenden som innehåller ordet 'asbest' per dag"
            data={asbestosCasesPerDay}
            valueLabel="Ärenden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <Card className="flex flex-col gap-y-4 border-gray-300">
              <CardHeader className="flex flex-row items-stretch space-y-0 border-gray-300 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                  <CardTitle>Företag med flest asbesthandlingar</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <Table className="text-base">
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-bold px-0">Län</TableHead>
                      <TableHead className="font-bold px-0">
                        Handlingar
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asbestosCompanyRanking
                      .slice(0, 10)
                      .map(({ companyName, documentCount }) => (
                        <TableRow key={companyName} className="border-gray-200">
                          <TableCell className="font-medium px-0">
                            {companyName}
                          </TableCell>
                          <TableCell className="px-0">
                            {documentCount}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="flex flex-col gap-y-4 border-gray-300">
              <CardHeader className="flex flex-row items-stretch space-y-0 border-gray-300 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                  <CardTitle>Kommuner med flest asbesthandlingar</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <Table className="text-base">
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-bold px-0">Län</TableHead>
                      <TableHead className="font-bold px-0">
                        Handlingar
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asbestosMunicipalityRanking
                      .slice(0, 10)
                      .map(
                        ({ municipalityName, countyName, documentCount }) => (
                          <TableRow
                            key={municipalityName}
                            className="border-gray-200"
                          >
                            <TableCell className="font-medium px-0">
                              <a
                                className="underline text-blue-600"
                                href={`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(countyName)}/${slugify(municipalityName)}`}
                              >
                                {_.capitalize(municipalityName)}
                              </a>
                            </TableCell>
                            <TableCell className="px-0">
                              {documentCount}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Main>
    </>
  );
}
