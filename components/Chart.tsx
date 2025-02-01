"use client";

import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export type ChartProps = {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  options: {
    title: {
      display: boolean;
      text: string;
    };
    plugins: {
      legend: {
        display?: boolean;
        position: "top" | "bottom" | "left" | "right";
      };
    };
  };
};

export function Chart(props: ChartProps) {
  return <Bar options={props.options} data={props.data} />;
}
