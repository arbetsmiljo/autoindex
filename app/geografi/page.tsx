import { Breadcrumbs } from "@arbetsmarknad/components/Breadcrumb";
import { Container } from "@arbetsmarknad/components/Container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@arbetsmarknad/components/Card";
import { Main } from "@arbetsmarknad/components/Main";
import { TopLevelHeading } from "@arbetsmarknad/components/TopLevelHeading";
import { Metadata } from "next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@arbetsmarknad/components/Table";
import { initKysely, countDocumentsByCounty } from "@/lib/database";
import { slugify } from "@/lib/slugify";
import _ from "lodash";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Arbetsmiljöinspektioner ${process.env.NEXT_PUBLIC_YEAR}`,
  };
}

export default async function Inspections() {
  const directoryPath = process.env.SOURCE_DIRECTORY_PATH;
  const databasePath = `${directoryPath}/db.sqlite`;
  const db = initKysely(databasePath);
  const documentsByCounty = await countDocumentsByCounty(db);

  return (
    <>
      <Breadcrumbs>
        {{
          "https://arbetsmarknad.github.io/": "Arbetsmarknad",
          "/": "Arbetsmiljö",
          [`/${process.env.NEXT_PUBLIC_YEAR}`]: `${process.env.NEXT_PUBLIC_YEAR}`,
          [`/${process.env.NEXT_PUBLIC_YEAR}/geografi`]: "Geografi",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-4">
          <TopLevelHeading
            text={`Arbetsmiljöhandlingar ${process.env.NEXT_PUBLIC_YEAR}`}
            subtext="Geografisk fördelning"
          />
          <div className="grid grid-cols-1 gap-4 w-full">
            <Card className="flex flex-col gap-y-4 border-background-secondary">
              <CardHeader className="flex flex-row items-stretch space-y-0 border-background-secondary border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                  <CardTitle>Handlingar per län</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <Table className="text-base">
                  <TableHeader>
                    <TableRow className="border-background-secondary">
                      <TableHead className="font-bold px-0">Län</TableHead>
                      <TableHead className="font-bold px-0">
                        Handlingar
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsByCounty.map(({ countyName, documentCount }) => (
                      <TableRow
                        key={countyName}
                        className="border-background-secondary"
                      >
                        <TableCell className="px-0">
                          <a
                            className="underline text-link"
                            href={`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(countyName)}`}
                          >
                            {_.capitalize(countyName)}
                          </a>
                        </TableCell>
                        <TableCell className="px-0">{documentCount}</TableCell>
                      </TableRow>
                    ))}
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
