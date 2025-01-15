import cron from "node-cron";
import prisma from "../prisma";

// Function to update term statuses
const updateTermStatuses = async () => {
  const currentDate = new Date();

  // Deactivate terms that have ended
  await prisma.term.updateMany({
    where: {
      end_date: {
        lt: currentDate,
      },
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Activate terms that have started
  await prisma.term.updateMany({
    where: {
      start_date: {
        lte: currentDate,
      },
      end_date: {
        gte: currentDate,
      },
      isActive: false,
    },
    data: {
      isActive: true,
    },
  });
};

// Schedule the job to run every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running term status update job");
  updateTermStatuses().catch((error) => {
    console.error("Error updating term statuses:", error);
  });
});
