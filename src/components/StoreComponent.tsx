import { FC, useState } from "react";
import StudentDetails from "../types/StudentDetails";
import { ShortStudentInfo } from "../types/User";

const StoreComponent: FC<{ register: ShortStudentInfo }> = ({ register }) => {
    /**
     * The basic flow of a storefront
     * 1. Enter the studentid of the target student
     * 2. Get store items from inventory
     * 3. Add store items to a virtual cart
     * 4. Checkout, enter paid fees and submit
     * 5. Create invoice doc, remove inventory items, add transaction to finance.
     */
    const [purchaser, setPurchaser] = useState<StudentDetails>();


    return <div className="w-full h-full">
        {!purchaser && <div className="grid place-items-center justify-center">
            
        </div>}
    </div>
}

export default StoreComponent;