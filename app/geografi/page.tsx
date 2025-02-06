import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@arbetsmarknad/components/Breadcrumb";
import { Container } from "@arbetsmarknad/components/Container";
import { HeaderMenu } from "@arbetsmarknad/components/HeaderMenu";
import { Footer } from "@arbetsmarknad/components/Footer";
import { Main } from "@arbetsmarknad/components/Main";
import { Page } from "@arbetsmarknad/components/Page";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
import { DateRangeBarChart } from "@/components/DateRangeBarChart";
import { Metadata } from "next";
import { initKysely, countCasesPerDay } from "@/lib/database";

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

  return (
    <Page>
      <HeaderMenu
        href="https://arbetsmiljo.github.io"
        text="arbetsmiljo.github.io"
      />
      <Breadcrumb>
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
            <BreadcrumbLink href={`/${process.env.NEXT_PUBLIC_YEAR}/geografi`}>
              Geografi
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
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
        </Container>
      </Main>
      <Footer
        sourceCode={[
          `arbetsmiljo/${process.env.NEXT_PUBLIC_YEAR}`,
          "arbetsmiljo/autoindex",
          "arbetsmarknad/components",
        ]}
      />
    </Page>
  );
}
