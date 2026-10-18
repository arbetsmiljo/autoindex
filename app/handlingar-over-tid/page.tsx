import { Breadcrumbs } from "@arbetsmarknad/components/Breadcrumb";
import { Container } from "@arbetsmarknad/components/Container";
import { Main } from "@arbetsmarknad/components/Main";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
import { Metadata } from "next";
import {
  initKysely,
  countDocumentsPerDay,
  countDocumentsByOriginPerWeek,
} from "@/lib/database";
import { StackedOriginBarChart } from "@/components/StackedOriginBarChart";
import { DateRangeBarChart } from "@/components/DateRangeBarChart";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Handlingar över tid ${process.env.NEXT_PUBLIC_YEAR}`,
  };
}

export default async function DocumentsOverTime() {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);

  const documentsPerDay = await countDocumentsPerDay(db);
  const documentsByOriginPerWeek = await countDocumentsByOriginPerWeek(db);

  return (
    <>
      <Breadcrumbs>
        {{
          "https://arbetsmarknad.github.io/": "Arbetsmarknad",
          "/": "Arbetsmiljö",
          [`/${process.env.NEXT_PUBLIC_YEAR}`]: `${process.env.NEXT_PUBLIC_YEAR}`,
          [`/${process.env.NEXT_PUBLIC_YEAR}/handlingar-over-tid`]:
            "Handlingar över tid",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-8 pb-16">
          <TopLevelHeading
            text={`Handlingar över tid ${process.env.NEXT_PUBLIC_YEAR}`}
            subtext="Fördelningen mellan inkommande, utgående och internt upprättade handlingar per dag."
          />

          <DateRangeBarChart
            title="Handlingar per dag"
            description="Antalet handlingar per dag genom året."
            data={documentsPerDay}
            valueLabel="Handlingar"
          />

          <StackedOriginBarChart
            title="Handlingsflöde per vecka"
            description="Andel inkommande, utgående och internt upprättade handlingar per vecka."
            data={documentsByOriginPerWeek}
          />
        </Container>
      </Main>
    </>
  );
}
