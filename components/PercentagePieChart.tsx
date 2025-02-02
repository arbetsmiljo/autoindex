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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@arbetsmarknad/components/Chart";

type PercentagePieChartProps = {
  title: string;
  description: string;
  numerator: number;
  denominator: number;
  numeratorLabel: string;
  complementLabel: string;
  percentSuffix: string;
  footer: React.ReactNode;
};

export const PercentagePieChart: FC<PercentagePieChartProps> = ({
  title,
  description,
  numerator,
  denominator,
  numeratorLabel,
  complementLabel,
  percentSuffix,
  footer,
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
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {footer}
        </div>
      </CardFooter>
    </Card>
  );
};
