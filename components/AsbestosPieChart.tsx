"use client";

import { FC } from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@arbetsmarknad/components/Card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@arbetsmarknad/components/Chart";

type AsbestosPieChartProps = {
  asbestosDocumentTotal: number;
  nonAsbestosDocumentTotal: number;
};

export const AsbestosPieChart: FC<AsbestosPieChartProps> = ({
  asbestosDocumentTotal,
  nonAsbestosDocumentTotal,
}) => {
  const chartData = [
    {
      browser: "Asbest",
      visitors: asbestosDocumentTotal,
      fill: "black",
    },
    {
      browser: "Icke-asbest",
      visitors: nonAsbestosDocumentTotal,
      fill: "#bbb",
    },
  ];

  const percentAsbestos = Math.round(
    (asbestosDocumentTotal /
      (asbestosDocumentTotal + nonAsbestosDocumentTotal)) *
      100,
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Asbesthandlingar</CardTitle>
        <CardDescription>Jamfört med totalt</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent className="w-[150px] bg-white" hideLabel />
              }
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {`${percentAsbestos}%`}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Asbest
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Av totalt {asbestosDocumentTotal + nonAsbestosDocumentTotal}{" "}
          handlingar är {asbestosDocumentTotal} p.g.a. asbest.
        </div>
      </CardFooter>
    </Card>
  );
};
