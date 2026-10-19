import { Breadcrumbs } from "@svenskamodellen/components/Breadcrumb";

import { Container } from "@svenskamodellen/components/Container";
import { Main } from "@svenskamodellen/components/Main";
import { TopLevelHeading } from "@svenskamodellen/components/TopLevelHeading";
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
import { Metadata } from "next";
import { initKysely, countCasesPerDay } from "@/lib/database";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Olycksfall ${process.env.NEXT_PUBLIC_YEAR}`,
  };
}

export default async function Accidents() {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);
  const accidentCasesPerDay = await countCasesPerDay(db, (q) =>
    q
      .where("caseName", "like", "%olycksfall%")
      .where("documentId", "like", "%-1"),
  );

  return (
    <>
      <Breadcrumbs>
        {{
          "https://svenskamodellen.github.io/": "Svenska modellen",
          "/": "Arbetsmiljö",
          [`/${process.env.NEXT_PUBLIC_YEAR}`]: `${process.env.NEXT_PUBLIC_YEAR}`,
          [`/${process.env.NEXT_PUBLIC_YEAR}/olycksfall`]: "Olycksfall",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading
            text={`Olycksfall ${process.env.NEXT_PUBLIC_YEAR}`}
          />
          <DateRangeBarChart
            title="Ärenden per dag"
            description="Antal nya ärenden som innehåller ordet 'olycksfall' per dag"
            data={accidentCasesPerDay}
            valueLabel="Ärenden"
          />
        </Container>
      </Main>
    </>
  );
}
