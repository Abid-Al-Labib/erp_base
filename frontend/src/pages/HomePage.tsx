import NavigationBar from "@/components/customui/NavigationBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const HomePage = () => {
  return (
    <>
    <NavigationBar/>
    <div className="flex h-screen flex-col justify-center items-center">
      <div className="grid grid-cols-3 gap-10">
          <Card
            className="max-w-xs p-2" x-chunk="charts-01-chunk-3"
          >
            <CardHeader>
              <CardTitle>Metric 1</CardTitle>
              <CardDescription>
                Over the last 7 days, your distance walked and run was 12.5 miles
                per day.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
              <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                12.5
                <span className="text-sm font-normal text-muted-foreground">
                  miles/day
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="max-w-xs p-2" x-chunk="charts-01-chunk-3"
          >
            <CardHeader>
              <CardTitle>Metric 2</CardTitle>
              <CardDescription>
                Over the last 7 days, your distance walked and run was 12.5 miles
                per day.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
              <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                12.5
                <span className="text-sm font-normal text-muted-foreground">
                  miles/day
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="max-w-xs p-2" x-chunk="charts-01-chunk-3"
          >
            <CardHeader>
              <CardTitle>Metric 3</CardTitle>
              <CardDescription>
                Over the last 7 days, your distance walked and run was 12.5 miles
                per day.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
              <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                12.5
                <span className="text-sm font-normal text-muted-foreground">
                  miles/day
                </span>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
    </>
  )
}

export default HomePage