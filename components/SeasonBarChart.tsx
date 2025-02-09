"use client";

import { FC } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

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

type SeasonBarChartProps = {
  title: string;
  href?: string;
  description: string;
  data: { season: string; count: number }[];
};

const t: (key: string) => string = (key) => {
  if (key === "spring") return "Vår";
  if (key === "summer") return "Sommar";
  if (key === "autumn") return "Höst";
  if (key === "winter") return "Vinter";
  return key;
};

export const SeasonBarChart: FC<SeasonBarChartProps> = ({
  title,
  href,
  description,
  data,
}) => {
  return (
    <Card className="flex flex-col border-gray-300">
      <CardHeader className="flex flex-row items-stretch space-y-0 border-gray-300 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>
            {href ? (
              <a className="text-blue-600 underline" href={href}>
                {title}
              </a>
            ) : (
              title
            )}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 py-2 flex items-center">
        <ChartContainer config={{}} className="aspect-auto h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid vertical={false} horizontal={false} />
            <YAxis
              dataKey="season"
              type="category"
              tickLine={false}
              tickMargin={0}
              axisLine={false}
              hide={true}
            />
            <XAxis dataKey="count" type="number" hide />

            <Bar dataKey="count" layout="vertical" radius={4}>
              <LabelList
                dataKey="season"
                position="insideLeft"
                offset={8}
                className="fill-white"
                fontSize={16}
                formatter={(value: string) => t(value)}
              />
              <LabelList
                dataKey="count"
                position="right"
                offset={8}
                className="fill-black"
                fontSize={16}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
