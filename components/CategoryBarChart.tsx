"use client";

import { FC } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@arbetsmarknad/components/Card";
import { ChartContainer } from "@arbetsmarknad/components/Chart";

type CategoryBarChartProps = {
  title: string;
  href?: string;
  description: string;
  data: { label: string; value: number }[];
  stat?: { label: string; value: string };
  yAxisWidth?: number;
  height?: number;
};

export const CategoryBarChart: FC<CategoryBarChartProps> = ({
  title,
  href,
  description,
  data,
  stat,
  yAxisWidth = 110,
  height = 250,
}) => {
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
        {stat && (
          <div className="flex">
            <div className="flex flex-1 flex-col justify-center gap-1 border-background-secondary border-l px-6 py-4 text-left sm:px-8 sm:py-6">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {stat.value}
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 items-center py-2">
        <ChartContainer config={{}} className="aspect-auto w-full" style={{ height }}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ left: 12, right: 40 }}
          >
            <CartesianGrid vertical={false} horizontal={false} />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={yAxisWidth}
              interval={0}
              stroke="var(--color-foreground)"
            />
            <XAxis dataKey="value" type="number" hide />
            <Bar
              dataKey="value"
              layout="vertical"
              radius={4}
              fill="var(--color-foreground)"
            >
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={16}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
