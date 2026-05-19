// react router
import { useLocation } from "react-router";

function useGetLocationPathValue() {
    const location = useLocation();
    const path = location.pathname;

    switch (path) {
        case "/dashboard/home":
            return "Home";

        case "/dashboard/accounts":
            return "Accounts";

        case "/dashboard/transactions":
            return "Transactions";

        case "/dashboard/analytics":
            return "Analytics";
        
        case "/dashboard/budget":
            return "Budget";
        
        case "/dashboard/goals":
            return "Goals";
        
        case "/dashboard/recurring":
            return "Recurring";
        
        case "/dashboard/reports":
            return "Reports";
        
        case "/dashboard/settings":
            return "Settings";
        
        default:
            return "Home";
    }
}

export default useGetLocationPathValue;