const cron      = require("node-cron");
const Project   = require("../models/Project");
const User      = require("../models/User");
const sendEmail = require("./sendEmail");

const THREE_HOURS = 3 * 60 * 60 * 1000;

// ═══════════════════════════════════════════════════
// ⏰ HOURLY CRON — Warning & Termination System
// ═══════════════════════════════════════════════════
cron.schedule("0 * * * *", async () => {
  console.log("⏰ [HOURLY CRON] Checking milestone warnings...");

  const projects = await Project.find({
    status:      "In Progress",
    fundsLocked: true,
  }).populate("freelancer", "name email").populate("client", "name email");

  const now = new Date();

  for (const project of projects) {
    if (!project.deadline || !project.createdAt) continue;

    const totalMs   = project.deadline - project.createdAt;
    const elapsedMs = now - project.createdAt;
    const remainMs  = project.deadline - now;
    const progress  = project.progressPercent || 0;

    if (totalMs <= 0 || remainMs < 0) continue; // already past deadline

    const elapsedRatio  = elapsedMs / totalMs;
    const remainingRatio= remainMs  / totalMs;

    // ── 50% Rule ──────────────────────────────────────
    if (
      elapsedRatio >= 0.5 &&
      progress === 0 &&
      project.warningLevel === "None"
    ) {
      project.warningLevel = "Yellow";
      await project.save();

      const daysLeft = Math.ceil(remainMs / (1000 * 60 * 60 * 24));

      if (project.freelancer?.email) {
        await sendEmail(
          project.freelancer.email,
          `⚠️ Warning: No Progress — ${project.title}`,
          `<h3>⚠️ Half Your Deadline Has Passed</h3>
           <p>You have logged <strong>0%</strong> progress on project <strong>${project.title}</strong>,
           but <strong>50%</strong> of your timeline is gone.</p>
           <p><strong>${daysLeft} days</strong> remaining. Please update your progress immediately.</p>`
        );
      }
      if (project.client?.email) {
        await sendEmail(
          project.client.email,
          `⚠️ Project Alert — ${project.title}`,
          `<h3>No Progress Logged at 50% Timeline</h3>
           <p>The freelancer on <strong>${project.title}</strong> has logged no progress, 
           but half the deadline has passed.</p>
           <p>${daysLeft} days remaining.</p>`
        );
      }
      console.log(`⚠️  [Yellow] Project ${project._id}: 50% time, 0% progress`);
    }

    // ── 1/3 Rule ──────────────────────────────────────
    if (
      remainingRatio <= 0.33 &&
      progress === 0 &&
      project.warningLevel !== "Red"
    ) {
      project.warningLevel    = "Red";
      project.strictWarningAt = now;
      await project.save();

      if (project.freelancer?.email) {
        await sendEmail(
          project.freelancer.email,
          `🚨 STRICT WARNING — ${project.title}`,
          `<h3>🚨 Critical: Only 1/3 of Your Time Remains</h3>
           <p>You have <strong>0%</strong> progress and only <strong>1/3</strong> of your deadline remains 
           for project <strong>${project.title}</strong>.</p>
           <p>If you do not log any progress within 3 hours, the client will be eligible to 
           <strong>terminate this project and reclaim funds</strong>.</p>
           <p>Log your progress immediately.</p>`
        );
      }
      console.log(`🚨  [Red] Project ${project._id}: 1/3 remaining, 0% progress`);
    }

    // ── 3-Hour Termination Gate ───────────────────────
    if (
      project.strictWarningAt &&
      now - project.strictWarningAt >= THREE_HOURS &&
      progress === 0 &&
      !project.terminationEligible
    ) {
      project.terminationEligible = true;
      await project.save();

      if (project.client?.email) {
        await sendEmail(
          project.client.email,
          `⚡ Termination Eligible — ${project.title}`,
          `<h3>⚡ You Can Now Terminate This Project</h3>
           <p>The freelancer on <strong>${project.title}</strong> received a strict warning 3+ hours ago 
           and has still logged <strong>0%</strong> progress.</p>
           <p>You may now log in and use the <strong>"Terminate & Refund"</strong> button to reclaim your funds 
           via the smart contract.</p>`
        );
      }
      console.log(`⚡  [Eligible] Project ${project._id}: termination unlocked`);
    }
  }
});

// ═══════════════════════════════════════════════════
// 📅 DAILY CRON (9 AM) — Days Remaining Reminder
// ═══════════════════════════════════════════════════
cron.schedule("0 9 * * *", async () => {
  console.log("📅 [DAILY CRON] Sending deadline reminder emails...");

  const projects = await Project.find({
    status:      "In Progress",
    fundsLocked: true,
  }).populate("freelancer", "name email");

  const now = new Date();

  for (const project of projects) {
    if (!project.freelancer?.email || !project.deadline) continue;

    const daysLeft = Math.ceil((project.deadline - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) continue;

    await sendEmail(
      project.freelancer.email,
      `📅 ${daysLeft} Day${daysLeft !== 1 ? "s" : ""} Remaining — ${project.title}`,
      `<h3>📅 Daily Progress Reminder</h3>
       <p>You have <strong>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong> remaining on project 
       <strong>${project.title}</strong>.</p>
       <p>Current progress: <strong>${project.progressPercent || 0}%</strong></p>
       <p>Please log in and update your progress to avoid warnings.</p>`
    );
  }
});

console.log("✅ Cron jobs initialized (Hourly warning + Daily reminder)");