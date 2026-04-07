const cron = require("node-cron");
const Project = require("../models/Project");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running cron job...");

  const projects = await Project.find({ status: "in-progress" });

  const now = new Date();

  for (let project of projects) {
    if (!project.lastUpdate) continue;

    const diffTime = now - project.lastUpdate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > 2) {
      project.warningCount += 1;

      console.log(`Warning added to project ${project._id}`);

      if (project.warningCount >= 3) {
        project.status = "terminated";
        console.log(`Project ${project._id} terminated`);
      }

      await project.save();
    }
  }
});