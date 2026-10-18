"use client";

import { FC } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@arbetsmarknad/components/Chart";

type StackedOriginBarChartProps = {
  title: string;
  description: string;
  data: {
    date: string;
    Inkommande: number;
    Utgående: number;
    Upprättad: number;
  }[];
};

const chartConfig = {
  Inkommande: { label: "Inkommande", color: "var(--color-foreground)" },
  Utgående: { label: "Utgående", color: "var(--color-link)" },
  Upprättad: {
    label: "Upprättad",
    color: "var(--color-background-secondary)",
  },
} satisfies ChartConfig;

function isoWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return (
    1 +
    Math.round(
      (d.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000),
    )
  );
}

export const StackedOriginBarChart: FC<StackedOriginBarChartProps> = ({
  title,
  description,
  data,
}) => {
  return (
    <Card className="w-full border-background-secondary">
      <CardHeader className="flex flex-row items-stretch space-y-0 border-background-secondary border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            stackOffset="expand"
            margin={{ left: 24, right: 24 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-background-secondary)"
            />
            <YAxis
              tickMargin={8}
              width={36}
              axisLine={false}
              tickSize={0}
              stroke="var(--color-foreground)"
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              minTickGap={32}
              stroke="var(--color-foreground)"
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
                  className="w-[180px] bg-background"
                  labelFormatter={(value) => {
                    const date = new Date(`${value}T00:00:00Z`);
                    const label = date.toLocaleDateString("sv-SE", {
                      month: "short",
                      day: "numeric",
                    });
                    return `Vecka ${isoWeek(date)} · ${label}`;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="Inkommande"
              stackId="a"
              fill="var(--color-foreground)"
            />
            <Bar dataKey="Utgående" stackId="a" fill="var(--color-link)" />
            <Bar
              dataKey="Upprättad"
              stackId="a"
              fill="var(--color-background-secondary)"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
