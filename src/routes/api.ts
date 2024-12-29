import express from "express"
import authRoute from "./authRoutes"
import schoolRoute from "./schoolRoutes"
import sessionRoutes from "./sessionRoutes"

const router = express.Router()

router.use("/auth", authRoute)
router.use("/school", schoolRoute)
router.use("/session", sessionRoutes)

export default router