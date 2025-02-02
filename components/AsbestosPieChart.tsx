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
  title: string;
  description: string;
  numerator: number;
  denominator: number;
};

export const AsbestosPieChart: FC<AsbestosPieChartProps> = ({
  title,
  description,
  numerator,
  denominator,
}) => {
  const complement = denominator - numerator;
  const chartData = [
    {
      browser: "Asbest",
      visitors: numerator,
      fill: "black",
    },
    {
      browser: "Icke-asbest",
      visitors: complement,
      fill: "#bbb",
    },
  ];

  const percentAsbestos = Math.round((numerator / denominator) * 100);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
          Av totalt {numerator} handlingar är {numerator} p.g.a. asbest.
        </div>
      </CardFooter>
    </Card>
  );
};
