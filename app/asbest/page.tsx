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
              <BreadcrumbLink href={`/${process.env.NEXT_PUBLIC_YEAR}/asbest`}>
                Asbest
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Container>
      </Breadcrumb>
      <main className="flex flex-col items-center w-full py-4">
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading text={`Asbest ${process.env.NEXT_PUBLIC_YEAR}`} />
          <DateRangeBarChart
            title="Ärenden per dag"
            description="Antal nya ärenden som innehåller ordet 'asbest' per dag"
            data={asbestosCasesPerDay}
            valueLabel="Ärenden"
          />
        </Container>
      </main>
    </Page>
  );
}
