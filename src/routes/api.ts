import express from "express"
import authRoute from "./authRoutes"
import schoolRoute from "./schoolRoutes"

const router = express.Router()

router.use("/auth", authRoute)
router.use("/school", schoolRoute)

export default router