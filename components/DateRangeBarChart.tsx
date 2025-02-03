"use client";

import * as React from "react";
import { FC } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@arbetsmarknad/components/Card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@arbetsmarknad/components/Chart";

type DateRangeBarChartProps = {
  title: string;
  description: string;
  data: { date: string; value: number }[];
};

export const DateRangeBarChart: FC<DateRangeBarChartProps> = ({
  title,
  description,
  data,
}) => {
  const chartConfig = {
    value: {
      label: "Handlingar",
      color: "black",
    },
  } satisfies ChartConfig;

  const total = data.reduce((acc, { value }) => {
    return acc + value;
  }, 0);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Totalt</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {total}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("sv-SE", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px] bg-white"
                  nameKey="value"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("sv-SE", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey="value" fill="black" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
