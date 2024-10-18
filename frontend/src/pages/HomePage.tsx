import NavigationBar from "@/components/customui/NavigationBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/context/AuthContext'; 
import { fetchMetricNotRunningMachines, fetchMetricRunningMachines } from "@/services/MachineServices";
import { fetchManagableOrders, fetchMetricActiveOrders } from "@/services/OrdersService";
import { useEffect, useState } from "react";
const HomePage = () => {
  const profile = useAuth().profile
  const [loadingMetricRunningMachines, setLoadingMetricRunningMachines] = useState<boolean>(false)
  const [loadingMetricNotRunningMachines, setLoadingMetricNotRunningMachines] = useState<boolean>(false)
  const [loadingMetricManagableOrders, setLoadingMetricManagableOrders] = useState<boolean>(false)
  const [loadingMetricActiveOrders, setLoadingMetricActiveOrders] = useState<boolean>(false)
  
  const [numberOfMachinesRunning, setNumberOfMachinesRunning] = useState<number|null>(null)
  const [numberOfMachinesNotRunning, setNumberOfMachinesNotRunning] = useState<number|null>(null)
  const [numberOfManagableOrders, setNumberOfManagableOrders] = useState<number|null>(null)
  const [numberOfActiveOrders, setNumberOfActiveOrders] = useState<number|null>(null)


  const loadMetricRunningMachines = async () => {
    setLoadingMetricRunningMachines(true);
    try {
      const runningMachines = await fetchMetricRunningMachines()
      setNumberOfMachinesRunning(runningMachines);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMetricRunningMachines(false);
    }
  };


  const loadMetricNotRunningMachines = async () => {
    setLoadingMetricNotRunningMachines(true);
    try {
      const notRunningMachines = await fetchMetricNotRunningMachines()
      setNumberOfMachinesNotRunning(notRunningMachines);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMetricNotRunningMachines(false);
    }
  };

  const loadMetricManagableOrders = async () => {
    setLoadingMetricManagableOrders(true);
    try {
      if (profile)
      { 
        const managableOrders = await fetchManagableOrders(profile.permission)
        setNumberOfManagableOrders(managableOrders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMetricManagableOrders(false);
    }
  };

  const loadMetricActiveOrders = async () => {
    setLoadingMetricActiveOrders(true);
    try {
      const runningOrders = await fetchMetricActiveOrders()
      setNumberOfActiveOrders(runningOrders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMetricActiveOrders(false);
    }
  };

  useEffect(()=>{
    loadMetricRunningMachines()
    loadMetricNotRunningMachines()
    loadMetricActiveOrders()
  },[])

  useEffect(() => {
    if (profile) {
      loadMetricManagableOrders();
    }
  }, [profile]); 

return (
    <>
      <NavigationBar />
      <div className="flex h-screen flex-col justify-center items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          
          {/* Machines Running */}
          <Card className="max-w-xs p-2">
            <CardHeader>
              <CardTitle>
                Machines running
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
              {loadingMetricRunningMachines ? (
                <div className="text-xl">Loading...</div>
              ) : (
                <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                  <span className="text-green-700">{numberOfMachinesRunning}</span>
                  {numberOfMachinesRunning==1?<span className="text-sm font-normal text-muted-foreground">machine</span>: <span className="text-sm font-normal text-muted-foreground">machines</span>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Machines Not Running */}
          <Card className="max-w-xs p-2">
            <CardHeader>
              <CardTitle>
                Machines not running
              </CardTitle>  
            </CardHeader>
            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
              {loadingMetricNotRunningMachines ? (
                <div className="text-xl">Loading...</div>
              ) : (
                <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                  <span className="text-red-700">{numberOfMachinesNotRunning}</span>
                  {numberOfMachinesNotRunning==1?<span className="text-sm font-normal text-muted-foreground">machine</span>: <span className="text-sm font-normal text-muted-foreground">machines</span>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Managable Orders */}
          <Card className="max-w-xs p-2">
            <CardHeader>
              <CardTitle>Managable Orders</CardTitle>
              <CardDescription>Number of active orders that require your actions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
              {loadingMetricManagableOrders ? (
                <div className="text-xl">Loading...</div>
              ) : (
                <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                  {numberOfManagableOrders}
                  <span className="text-sm font-normal text-muted-foreground">orders</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Running Orders */}
          <Card className="max-w-xs p-2">
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>Total number of orders that have not been completed i.e parts not recieved</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
              {loadingMetricActiveOrders ? (
                <div className="text-xl">Loading...</div>
              ) : (
                <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                  {numberOfActiveOrders}
                  <span className="text-sm font-normal text-muted-foreground">orders</span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
};

export default HomePage
