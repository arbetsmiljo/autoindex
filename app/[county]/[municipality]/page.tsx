import _ from "lodash";
import { Breadcrumbs } from "@arbetsmarknad/components/Breadcrumb";
import { Container } from "@arbetsmarknad/components/Container";
import { Main } from "@arbetsmarknad/components/Main";
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
    <>
      <Breadcrumbs>
        {{
          "https://arbetsmarknad.github.io/": "Arbetsmarknad",
          "/": "Arbetsmiljö",
          [`/${process.env.NEXT_PUBLIC_YEAR}`]: `${process.env.NEXT_PUBLIC_YEAR}`,
          [`/${process.env.NEXT_PUBLIC_YEAR}/geografi`]: "Geografi",
          [`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(county.countyName)}`]: `${_.capitalize(county.countyName)}`,
          [`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(county.countyName)}/${slugify(municipality.municipalityName)}`]: `${_.capitalize(municipality.municipalityName)}`,
        }}
      </Breadcrumbs>

      <Main>
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
      </Main>
    </>
  );
}
