import { Breadcrumbs } from "@svenskamodellen/components/Breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@svenskamodellen/components/Card";
import { Container } from "@svenskamodellen/components/Container";
import { Main } from "@svenskamodellen/components/Main";
import { TopLevelHeading } from "@svenskamodellen/components/TopLevelHeading";
import { Metadata } from "next";
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
import {
  countCasesPerDay,
  initKysely,
  selectSixSixACases,
} from "@/lib/database";
import { generateDiariumUrl } from "@/lib/diarium";
import { endOfYear, format, parseISO, startOfYear } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@svenskamodellen/components/Table";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `6:6a-begäranden ${process.env.NEXT_PUBLIC_YEAR}`,
    description:
      "Statistik över begäranden från skyddsombud enligt 6 kap. 6 a § arbetsmiljölagen.",
  };
}

export default async function SixSixA() {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);
  const sixSixACases = await selectSixSixACases(db);
  const sixSixACasesPerDay = await countCasesPerDay(db, (q) =>
    q
      .where((eb) =>
        eb.or([
          eb("caseName", "like", "%6:6a%"),
          eb("caseName", "like", "%6-6a%"),
          eb("caseName", "like", "%6 kap. 6 a%"),
          eb("caseSubject", "like", "%6:6a%"),
          eb("caseSubject", "like", "%6-6a%"),
          eb("caseSubject", "like", "%6 kap. 6 a%"),
          eb("documentType", "=", "Begäran från skyddsombud om ingripande"),
        ]),
      )
      .where("documentId", "like", "%-1"),
  );

  const year = parseISO(process.env.NEXT_PUBLIC_YEAR!);
  const diariumUrl = generateDiariumUrl({
    SearchText: "Begäran från skyddsombud om ingripande",
    FromDate: format(startOfYear(year), "yyyy-MM-dd"),
    ToDate: format(endOfYear(year), "yyyy-MM-dd"),
  });

  return (
    <>
      <Breadcrumbs>
        {{
          "https://svenskamodellen.github.io/": "Svenska modellen",
          "/": "Arbetsmiljö",
          [`/${process.env.NEXT_PUBLIC_YEAR}`]: `${process.env.NEXT_PUBLIC_YEAR}`,
          [`/${process.env.NEXT_PUBLIC_YEAR}/6-6a`]: "6:6a",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-8 pb-8">
          <TopLevelHeading
            text={`6:6a-begäranden ${process.env.NEXT_PUBLIC_YEAR}`}
            subtext="Begäranden från skyddsombud enligt 6 kap. 6 a § arbetsmiljölagen"
          />

          <DateRangeBarChart
            title="Nya 6:6a-ärenden per dag"
            description="Antal nya diarieförda ärenden som identifierats som 6:6a-begäranden per dag"
            data={sixSixACasesPerDay}
            valueLabel="Ärenden"
          />

          <Card className="w-full border-background-secondary">
            <CardHeader className="border-background-secondary border-b">
              <CardTitle>6:6a-begäranden under året</CardTitle>
              <CardDescription>
                Kronologisk lista över 6:6a-begäranden
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <Table className="text-base">
                <TableHeader>
                  <TableRow className="border-background-secondary">
                    <TableHead className="font-bold px-0">Datum</TableHead>
                    <TableHead className="font-bold px-0">Ärende</TableHead>
                    <TableHead className="font-bold px-0">Arbetsplats</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sixSixACases.map((sixSixACase) => (
                    <TableRow
                      key={sixSixACase.caseId}
                      className="border-background-secondary"
                    >
                      <TableCell className="px-0 whitespace-nowrap">
                        {format(parseISO(sixSixACase.documentDate), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="px-0 whitespace-nowrap">
                        <a
                          className="text-link underline"
                          href={generateDiariumUrl({
                            SearchText: sixSixACase.caseId,
                          })}
                        >
                          {sixSixACase.caseId}
                        </a>
                      </TableCell>
                      <TableCell className="px-0">
                        {sixSixACase.companyName ??
                          sixSixACase.workplaceName ??
                          "–"}
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Container>
      </Main>
    </>
  );
}
