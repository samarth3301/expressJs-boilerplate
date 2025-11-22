import adminController from "@/controllers/v1/auth";
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router()

// Public routes
router.post("/register", ...adminController.register)
router.post("/login", ...adminController.login)
router.post("/refresh-token", adminController.refresh_token)

// Protected routes
router.use(authenticate)
router.post("/logout", adminController.logout)
router.get("/profile", adminController.get_profile)
router.put("/profile", ...adminController.update_profile)
router.put("/change-password", ...adminController.change_password)

export default router;