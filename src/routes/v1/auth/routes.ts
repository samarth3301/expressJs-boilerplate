import { v1Controllers } from "@/controllers";
import { Router } from "express";

const router = Router()

router.get("/example", v1Controllers.authControllers.admin.example_controller)

export default router;