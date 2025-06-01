import { Router } from "express";
import authRoutes from "./auth/routes";

const v1Router = Router()

const v1_routes = [
    {
        path: "/auth",
        route: authRoutes
    }
]
v1_routes.forEach(route => {
    v1Router.use(route.path, route.route)
})

export default v1Router;