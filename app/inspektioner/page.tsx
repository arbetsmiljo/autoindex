import { startOfYear, endOfYear, format, parseISO } from "date-fns";
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
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
import { Metadata } from "next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@arbetsmarknad/components/Table";
import {
  initKysely,
  countCasesPerDay,
  countDocumentsByInspectionType,
} from "@/lib/database";
import { generateDiariumUrl } from "@/lib/diarium";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Arbetsmiljöinspektioner ${process.env.NEXT_PUBLIC_YEAR}`,
  };
}

export default async function Inspections() {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);
  const inspectionCasesPerDay = await countCasesPerDay(db, (q) =>
    q
      .where("caseName", "like", "%inspektion%")
      .where("documentId", "like", "%-1"),
  );

  const documentsPerInspectionType = await countDocumentsByInspectionType(db);

  return (
    <>
      <Breadcrumbs>
        {{
          "https://arbetsmarknad.codeberg.page/": "Arbetsmarknad",
          "/": "Arbetsmiljö",
          [`/${process.env.NEXT_PUBLIC_YEAR}`]: `${process.env.NEXT_PUBLIC_YEAR}`,
          [`/${process.env.NEXT_PUBLIC_YEAR}/inspektioner`]: "Inspektioner",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading
            text={`Arbetsmiljöinspektioner ${process.env.NEXT_PUBLIC_YEAR}`}
          />
          <DateRangeBarChart
            title="Ärenden per dag"
            description="Antal nya ärenden som innehåller ordet 'inspektion' per dag"
            data={inspectionCasesPerDay}
            valueLabel="Ärenden"
          />

          <div className="grid grid-cols-1 gap-4 w-full">
            <Card className="flex flex-col gap-y-4 border-background-secondary">
              <CardHeader className="flex flex-row items-stretch space-y-0 border-background-secondary border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                  <CardTitle>Handlingar per kategori</CardTitle>
                  <CardDescription>
                    Antal handlingar per inspektionskategori
                  </CardDescription>
                </div>
                <div className="flex">
                  <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left border-background-secondary even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
                    <span className="text-xs text-muted-foreground">
                      Totalt
                    </span>
                    <span className="text-lg font-bold leading-none sm:text-3xl">
                      {documentsPerInspectionType.reduce(
                        (acc, { count }) => acc + count,
                        0,
                      )}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <Table className="text-base">
                  <TableHeader>
                    <TableRow className="border-background-secondary">
                      <TableHead className="font-bold px-0">
                        Inspektionskategori
                      </TableHead>
                      <TableHead className="font-bold px-0">
                        Handlingar
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsPerInspectionType.map(
                      ({ inspectionType, count }) => (
                        <TableRow
                          key={inspectionType}
                          className="border-background-secondary"
                        >
                          <TableCell className="font-medium px-0">
                            <a
                              className="text-link underline"
                              href={generateDiariumUrl({
                                SearchText: `Inspektion inom ${inspectionType}`,
                                FromDate: format(
                                  startOfYear(
                                    parseISO(process.env.NEXT_PUBLIC_YEAR!),
                                  ),
                                  "yyyy-MM-dd",
                                ),
                                ToDate: format(
                                  endOfYear(
                                    parseISO(process.env.NEXT_PUBLIC_YEAR!),
                                  ),
                                  "yyyy-MM-dd",
                                ),
                              })}
                            >
                              {inspectionType}
                            </a>
                          </TableCell>
                          <TableCell className="px-0">{count}</TableCell>
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
