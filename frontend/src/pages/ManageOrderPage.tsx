import { Link, useNavigate, useParams } from "react-router-dom";
import OrderInfo from "@/components/customui/OrderInfo";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Order } from "@/types";
import { fetchOrderByID } from "@/services/OrdersService";
import { convertUtcToBDTime } from "@/services/helper";
import OrderedPartsTable from "@/components/customui/OrderedPartsTable";
import { Button } from "@/components/ui/button";


const ManageOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrder = async () => {
      if (!id || isNaN(parseInt(id))) {
        toast.error("Invalid order ID");
        navigate("/orders");
        return;
      }
      const order_id = parseInt(id);
      try {
        const data = await fetchOrderByID(order_id);
        console.log(data)
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
    loadOrder();
  }, [id, navigate]);
  
  if (loading) {
    return <div>Loading...</div>; // Add a loading state if necessary
  }

  return (
    <div className="mx-4">
      <OrderInfo
        order={orders[0]}
      />
      <OrderedPartsTable
        mode="manage"
        order_id={orders[0].id}
        current_status = {orders[0].statuses}
      />
      <div className="flex justify-end">
        <div className="my-3 mx-3">
          <Link to={'/orders'}><Button>Back To Orders</Button></Link>
        </div>
      </div>
    </div>
  )
}

export default ManageOrderPage