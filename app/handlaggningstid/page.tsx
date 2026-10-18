import { Breadcrumbs } from "@arbetsmarknad/components/Breadcrumb";
import { Container } from "@arbetsmarknad/components/Container";
import { Main } from "@arbetsmarknad/components/Main";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
import { Metadata } from "next";
import {
  initKysely,
  countCaseHandlingTime,
  countSingleDocumentCaseShare,
  countHandlingTimeBySubject,
  countHandlingTimeByCounty,
} from "@/lib/database";
import { CategoryBarChart } from "@/components/CategoryBarChart";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Handläggningstid ${process.env.NEXT_PUBLIC_YEAR}`,
  };
}

export default async function HandlingTime() {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);

  const caseHandlingTime = await countCaseHandlingTime(db);
  const singleDocumentCaseShare = await countSingleDocumentCaseShare(db);
  const handlingTimeBySubject = await countHandlingTimeBySubject(db);
  const handlingTimeByCounty = await countHandlingTimeByCounty(db);

  return (
    <>
      <Breadcrumbs>
        {{
          "https://arbetsmarknad.github.io/": "Arbetsmarknad",
          "/": "Arbetsmiljö",
          [`/${process.env.NEXT_PUBLIC_YEAR}`]: `${process.env.NEXT_PUBLIC_YEAR}`,
          [`/${process.env.NEXT_PUBLIC_YEAR}/handlaggningstid`]:
            "Handläggningstid",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-8 pb-16">
          <TopLevelHeading
            text={`Handläggningstid ${process.env.NEXT_PUBLIC_YEAR}`}
            subtext="Tid från första till sista handling i ärenden med fler än en handling."
          />

          <CategoryBarChart
            title="Handläggningstid"
            description="Tid från första till sista handling i ärenden med fler än en handling."
            data={caseHandlingTime}
            stat={{
              label: "Engångsärenden",
              value: `${singleDocumentCaseShare.percent}%`,
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
            <CategoryBarChart
              title="Handläggningstid per ärendetyp"
              description="Genomsnittligt antal dagar från första till sista handling."
              data={handlingTimeBySubject}
              yAxisWidth={160}
            />
            <CategoryBarChart
              title="Handläggningstid per län"
              description="Genomsnittligt antal dagar från första till sista handling."
              data={handlingTimeByCounty}
              yAxisWidth={140}
              height={560}
            />
          </div>
        </Container>
      </Main>
    </>
  );
}
