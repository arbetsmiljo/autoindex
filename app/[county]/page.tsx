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
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
import {
  initKysely,
  selectDistinctCounties,
  countDocumentsPerDay,
  selectDistinctCountiesAndMunicipalities,
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

  const countiesAndMunicipalities =
    await selectDistinctCountiesAndMunicipalities(db);
  const municipalities = countiesAndMunicipalities
    .filter(([c]) => c.countyId === county.countyId)
    .map(([, m]) => m);

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
                href={`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(county.countyName)}`}
              >
                {_.capitalize(county.countyName)}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Container>
      </Breadcrumb>
      <main className="flex flex-col items-center w-full py-4">
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
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>Kommuner</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <ul className="flex flex-col gap-2">
                  {municipalities.map((municipality) => (
                    <li key={municipality.municipalityId}>
                      <a
                        className="underline text-blue-600"
                        href={`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(county.countyName)}/${slugify(municipality.municipalityName)}`}
                      >
                        {_.capitalize(municipality.municipalityName)}
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
