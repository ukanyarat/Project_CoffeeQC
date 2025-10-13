export const permissionMap: Record<string, Record<string, "A" | "R" | "N">> = {
    user: {
        admin: "A",
        owner: "A",
        employee: "A"
    },
    role: {
        admin: "A",
        owner: "R",
        employee: "N"
    },
    menu: {
        admin: "A",
        owner: "A",
        employee: "N"
    },
    category: {
        admin: "A",
        owner: "A",
        employee: "N"
    },
    order: {
        admin: "A",
        owner: "A",
        employee: "N"
    },
    orderList: {
        admin: "A",
        owner: "A",
        employee: "N"
    },
    company: {
        admin: "A",
        owner: "A",
        employee: "N"
    },
    customer :{
        admin: "A",
        owner: "A",
        employee: "N"
    }
};
