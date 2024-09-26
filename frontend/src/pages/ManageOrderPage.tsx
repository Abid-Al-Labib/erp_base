import { Link, useNavigate, useParams } from "react-router-dom";
import OrderInfo from "@/components/customui/OrderInfo";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Order } from "@/types";
import { fetchOrderByID } from "@/services/OrdersService";
import OrderedPartsTable from "@/components/customui/OrderedPartsTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { managePermission } from "@/services/helper";


const ManageOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const profile = useAuth().profile

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
        if (data) {
          setOrder(data);
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

  if (order){
    if (profile && profile.permission)
      {
        if(!managePermission(order.statuses.name,profile.permission)){
          return <div>You are not authorized to access at this stage</div>;
        }
      }
  }
  else{
    toast.error("No order found with this id")
    return <div>No order found</div>; // Handle the case where no orders are returned
  }


  return (
    <div className="mx-4">
        <OrderInfo
          order={order}
        />
       <OrderedPartsTable
          mode="manage"
          order={order}
          current_status = {order.statuses}
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