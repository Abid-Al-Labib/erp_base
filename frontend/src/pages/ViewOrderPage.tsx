import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatusTracker from "@/components/customui/StatusTracker";
import OrderInfo from "@/components/customui/OrderInfo";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Order } from "@/types";
import { fetchOrderByID } from "@/services/OrdersService";
import { convertUtcToBDTime } from "@/services/helper";

const ViewOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      if (!id || isNaN(parseInt(id))) {
        toast.error("Invalid order ID");
        navigate("/orders");
        return;
      }
      const order_id = parseInt(id);
      try {
        const data = await fetchOrderByID(order_id);
        if (data && data.length > 0) {
          setOrders(data);
        } else {
          toast.error("Order not found");
          navigate("/orders");
        }
      } catch (error) {
        toast.error("Failed to fetch order info");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [id, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Add a loading state if necessary
  }

  if (orders.length === 0) {
    toast.error("No order found with this id")
    return <div>No order found</div>; // Handle the case where no orders are returned
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 mt-2">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
            <OrderInfo
              id={orders[0].id}
              created_at={convertUtcToBDTime(orders[0].created_at)}
              created_by={orders[0].profiles.name}
              department_name={orders[0].departments.name}
              current_status={orders[0].statuses.name}
              note={orders[0].order_note}
            />
          </div>
        </div>
        <div>
          <StatusTracker order_id={orders[0].id} />
        </div>
      </main>
      <div className="flex justify-end">
        <div className="my-3 mx-3">
          <Link to={'/orders'}><Button>Back To Orders</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderPage;
