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
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
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
  selectDistinctCounties,
  countDocumentsPerDay,
  countDocumentsByMunicipality,
} from "@/lib/database";
import { slugify } from "@/lib/slugify";

type CountyParams = {
  county: string;
};

type CountyProps = {
  params: Promise<CountyParams>;
};

export async function generateStaticParams(): Promise<CountyParams[]> {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);
  const counties = await selectDistinctCounties(db);
  return counties.map((county) => ({ county: slugify(county.countyName) }));
}

export default async function County(props: CountyProps) {
  const params = await props.params;
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);
  const counties = await selectDistinctCounties(db);
  const county = counties.find(
    (county) => slugify(county.countyName) === params.county,
  )!;
  const documentsPerDay = await countDocumentsPerDay(db, (q) =>
    q.where("countyId", "=", county.countyId),
  );

  const documentsByMunicipality = await countDocumentsByMunicipality(
    db,
    county.countyName,
  );

  return (
    <>
      <Breadcrumbs>
        {{
          "https://arbetsmarknad.codeberg.page/": "Arbetsmarknad",
          "/": "Arbetsmiljö",
          [`/${process.env.NEXT_PUBLIC_YEAR}`]: `${process.env.NEXT_PUBLIC_YEAR}`,
          [`/${process.env.NEXT_PUBLIC_YEAR}/geografi`]: "Geografi",
          [`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(county.countyName)}`]: `${_.capitalize(county.countyName)}`,
        }}
      </Breadcrumbs>

      <Main>
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading
            text={`Arbetsmiljö ${_.capitalize(county.countyName)} ${process.env.NEXT_PUBLIC_YEAR}`}
          />

          <DateRangeBarChart
            title="Handlingar per dag"
            description="Visar antalet handlingar per dag genom året."
            data={documentsPerDay}
            valueLabel="Handlingar"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <Card className="flex flex-col gap-y-4 border-background-secondary">
              <CardHeader className="items-center pb-0">
                <CardTitle>Geografisk fördelning</CardTitle>
                <CardDescription>Antal handlingar per kommun</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-background-secondary">
                      <TableHead className="font-bold">Län</TableHead>
                      <TableHead className="font-bold">Handlingar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsByMunicipality.map(
                      ({ municipalityName, documentCount }) => (
                        <TableRow
                          key={municipalityName}
                          className="border-background-secondary"
                        >
                          <TableCell className="font-medium">
                            <a
                              className="underline text-link"
                              href={`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(county.countyName)}/${slugify(municipalityName)}`}
                            >
                              {_.capitalize(municipalityName)}
                            </a>
                          </TableCell>
                          <TableCell>{documentCount}</TableCell>
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
