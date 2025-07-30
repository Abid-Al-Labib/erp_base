import { useSearchParams } from "react-router-dom";
import NavigationBar from "@/components/customui/NavigationBar";
import ManagementCard from "@/components/customui/ManagementCards/ManagementCard";
import ExpandedManagementCard from "@/components/customui/ManagementCards/ExpandedManagementCard";
import { ManagementType } from "@/types";
import { Building, Settings, Box, UserPlus, UserCog } from "lucide-react";

const ManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const managementType = searchParams.get("card") as ManagementType | null;

  const handleExpand = (type: ManagementType) => {
    setSearchParams({ card: type });
  };

  const handleClose = () => {
    setSearchParams({});
  };

  return (
    <>
      <NavigationBar />
      <div className="p-6 flex flex-col items-center space-y-6">
        <h1 className="text-2xl font-bold">Factory Management</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ManagementCard 
            icon={<Building />} 
            title="Edit Factory" 
            subtext="Manage factories" 
            onClick={() => handleExpand("factory")} 
          />
          <ManagementCard 
            icon={<Settings />} 
            title="Edit Factory Section" 
            subtext="Manage factory sections" 
            onClick={() => handleExpand("factorySections")} 
          />
          <ManagementCard 
            icon={<Box />} 
            title="Edit Machine" 
            subtext="Manage machines" 
            onClick={() => handleExpand("machines")} 
          />
          <ManagementCard 
            icon={<Box />} 
            title="Edit Machine Parts" 
            subtext="Manage machine parts" 
            onClick={() => handleExpand("machineParts")} 
          />
          <ManagementCard 
            icon={<Box />} 
            title="Edit Departments" 
            subtext="Manage departments" 
            onClick={() => handleExpand("departments")} 
          />
        </div>
        {/* <h1 className="text-2xl font-bold">User Management</h1>
        <div className="grid  grid-cols-1 lg:grid-cols-3 gap-4">
          <ManagementCard 
            icon={<UserPlus />} 
            title="Add User" 
            subtext="Add a new user to the system" 
            onClick={() => handleExpand("addUser")} 
          />
          <ManagementCard 
            icon={<UserCog />} 
            title="Manage User" 
            subtext="Manage user info and permission" 
            onClick={() => handleExpand("manageUser")} 
          />
        </div> */}
        <h1 className="text-2xl font-bold">App Management</h1>
        <div className="grid  grid-cols-1 lg:grid-cols-3 gap-4">
          <ManagementCard 
            icon={<UserPlus />} 
            title="Allow/Deny Action" 
            subtext="Add a new user to the system" 
            onClick={() => handleExpand("allowDenyAction")} 
          />
        </div>

      </div>

      {managementType && <ExpandedManagementCard type={managementType} onClose={handleClose} />}
    </>
  );
};

export default ManagementPage;
