import { Breadcrumbs } from "@arbetsmarknad/components/Breadcrumb";
import { Card, CardContent } from "@arbetsmarknad/components/Card";
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
          "https://arbetsmarknad.github.io/": "Arbetsmarknad",
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
            <Card className="flex flex-col gap-y-4 border-gray-300">
              <CardContent className="flex-1 pb-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-bold">
                        Inspektionskategori
                      </TableHead>
                      <TableHead className="font-bold">Handlingar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsPerInspectionType.map(
                      ({ inspectionType, count }) => (
                        <TableRow
                          key={inspectionType}
                          className="border-gray-200"
                        >
                          <TableCell className="font-medium">
                            {inspectionType}
                          </TableCell>
                          <TableCell>{count}</TableCell>
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
