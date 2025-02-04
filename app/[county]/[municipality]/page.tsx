import _ from "lodash";
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
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
import {
  initKysely,
  selectDistinctCountiesAndMunicipalities,
  countDocumentsPerDay,
} from "@/lib/database";
import { slugify } from "@/lib/slugify";

type MunicipalityParams = {
  county: string;
  municipality: string;
};

type MunicipalityProps = {
  params: Promise<MunicipalityParams>;
};

export async function generateStaticParams(): Promise<MunicipalityParams[]> {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);
  const data = await selectDistinctCountiesAndMunicipalities(db);
  return data.map(([county, municipality]) => ({
    county: slugify(county.countyName),
    municipality: slugify(municipality.municipalityName),
  }));
}

export default async function County(props: MunicipalityProps) {
  const params = await props.params;
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);
  const data = await selectDistinctCountiesAndMunicipalities(db);
  const [county, municipality] = data.find(
    ([county, municipality]) =>
      slugify(county.countyName) === params.county &&
      slugify(municipality.municipalityName) === params.municipality,
  )!;
  const documentsPerDay = await countDocumentsPerDay(db, (q) =>
    q.where("municipalityId", "=", municipality.municipalityId),
  );

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
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(county.countyName)}/${slugify(municipality.municipalityName)}`}
              >
                {_.capitalize(municipality.municipalityName)}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Container>
      </Breadcrumb>
      <main className="flex flex-col items-center w-full py-4">
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading
            text={`Arbetsmiljö ${_.capitalize(municipality.municipalityName)} ${process.env.NEXT_PUBLIC_YEAR}`}
          />
          <DateRangeBarChart
            title="Handlingar per dag"
            description="Visar antalet handlingar per dag genom året."
            data={documentsPerDay}
            valueLabel="Handlingar"
          />
        </Container>
      </main>
    </Page>
  );
}
