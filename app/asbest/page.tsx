import { Breadcrumbs } from "@arbetsmarknad/components/Breadcrumb";
import { Container } from "@arbetsmarknad/components/Container";
import { Main } from "@arbetsmarknad/components/Main";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
import { Metadata } from "next";
import { initKysely, countCasesPerDay } from "@/lib/database";

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
        </Container>
      </Main>
    </>
  );
}
