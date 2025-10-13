import { handleServiceResponse ,validateRequest} from "@common/utility/httpHandlers";
import express, { Request, Response } from "express";
import { LoginUserSchema } from "@modules/user/userModel";
import { userService } from "./userService";

export const userRouter = (() => {
    const router = express.Router();

    //เทส
    router.get("/test", (req: Request, res: Response) => {
        res.send("User router test is success");
    });
    //login
    router.post("/login",
        validateRequest(LoginUserSchema),
        async (req: Request, res: Response) => {
            const payload = req.body;
            const ServiceResponse = await userService.login(payload, res);
            handleServiceResponse(ServiceResponse, res);
        });

    //logout
    router.get("/logout",
        async (req: Request, res: Response) => {
            const serviceResponse = await userService.logout(res);
            handleServiceResponse(serviceResponse, res);
        }
    )
    return router;
})();