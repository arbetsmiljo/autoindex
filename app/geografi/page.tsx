import { Breadcrumbs } from "@arbetsmarknad/components/Breadcrumb";
import { Container } from "@arbetsmarknad/components/Container";
import { Card, CardContent } from "@arbetsmarknad/components/Card";
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
            <Card className="flex flex-col gap-y-4 border-gray-300">
              <CardContent className="flex-1 pb-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-bold">Län</TableHead>
                      <TableHead className="font-bold">Handlingar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsByCounty.map(({ countyName, documentCount }) => (
                      <TableRow key={countyName} className="border-gray-200">
                        <TableCell className="font-medium">
                          <a
                            className="underline text-blue-600"
                            href={`/${process.env.NEXT_PUBLIC_YEAR}/${slugify(countyName)}`}
                          >
                            {_.capitalize(countyName)}
                          </a>
                        </TableCell>
                        <TableCell>{documentCount}</TableCell>
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
