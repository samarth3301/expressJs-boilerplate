import catchAsync from "@/handlers/async.handler";
import { Request, Response } from "express";

const example_controller = catchAsync(async (req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        message: "Server is running",
        timestamp: new Date().toISOString()
    })
})

export default { example_controller }