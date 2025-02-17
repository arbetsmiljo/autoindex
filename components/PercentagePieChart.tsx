"use client";

import { FC } from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@arbetsmarknad/components/Card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@arbetsmarknad/components/Chart";

type PercentagePieChartProps = {
  title: string;
  href?: string;
  description: string;
  numerator: number;
  denominator: number;
  numeratorLabel: string;
  complementLabel: string;
  percentSuffix: string;
};

export const PercentagePieChart: FC<PercentagePieChartProps> = ({
  title,
  href,
  description,
  numerator,
  denominator,
  numeratorLabel,
  complementLabel,
  percentSuffix,
}) => {
  const complement = denominator - numerator;
  const chartData = [
    {
      name: numeratorLabel,
      data: numerator,
      fill: "black",
    },
    {
      name: complementLabel,
      data: complement,
      fill: "#bbb",
    },
  ];

  const percent = Math.round((numerator / denominator) * 100);

  return (
    <Card className="flex flex-col border-background-secondary">
      <CardHeader className="flex flex-row items-stretch space-y-0 border-background-secondary border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>
            {href ? (
              <a className="text-link underline" href={href}>
                {title}
              </a>
            ) : (
              title
            )}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
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
              dataKey="data"
              nameKey="name"
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
                          {`${percent}%`}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {percentSuffix}
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
    </Card>
  );
};
