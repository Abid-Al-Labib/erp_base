import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Part } from "@/types";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"



const predefinedColors = [
  "#ff8b94", // rose (moved near magenta)
  "#ffaaa5", // coral (visually balances rose)
  "#ffd3b6", // peach
  "#fbe0ae", // warm yellow
  "#dcedc1", // yellow-green
  "#bcfbae", // light green
  "#a8e6cf", // mint / teal
  "#bbc0ff", // periwinkle / blue
  "#fbbee9", // pink-magenta
  "#f49fc2", // soft mid-pink
];

// Function to get a color from the predefined array
function getColor(index: number) {
  return predefinedColors[index % predefinedColors.length];
}

type ChartItem<T> = {
  monthly: T[];
  allTime: T[];
  getName: (item: T) => string;
  title: string;
  description: string;
};

export default function ToggleBarChart<T>({
  monthly,
  allTime,
  getName,
  title,
  description,
}: ChartItem<T>) {
  const [view, setView] = useState<"monthly" | "all">("monthly");
  const selectedData = view === "monthly" ? monthly : allTime;

  const chartData = selectedData.map((item, index) => ({
    name: getName(item),
    orders: (item as any).order_count, // you could also pass a `getCount` fn
    fill: getColor(index),
  }));

  const chartConfig = {
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-1))",
    },
    label: {
      color: "hsl(var(--background))",
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-6 pt-6">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {description}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Label className="text-xs">Monthly</Label>
          <Switch
            id="view-toggle"
            checked={view === "all"}
            onCheckedChange={(checked) => setView(checked ? "all" : "monthly")}
          />
          <Label className="text-xs">All Time</Label>
        </div>
      </CardHeader>

      <CardContent className="px-6">
        <ChartContainer config={chartConfig} style={{ height: 400 }}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={200}
              interval={0}
              tick={({ x, y, payload }) => (
                <text
                  x={x}
                  y={y}
                  dy={4}
                  textAnchor="end"
                  fill="#000000"
                  fontSize={14}
                  // fontWeight="bold"
                >
                  {payload.value.length > 24 ? payload.value.slice(0, 24) + "…" : payload.value}
                </text>
              )}
            />
            <XAxis dataKey="orders" type="number" tick={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="bar" />} />
            <Bar dataKey="orders" radius={[4, 4, 4, 4]} barSize={25}>
              <LabelList dataKey="orders" position="right" className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

