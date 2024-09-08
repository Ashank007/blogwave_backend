import cron from "node-cron";
import User from "../models/user.js";

cron.schedule('* * *', async () => {
  try {
    const expirationdate = new Date();
    expirationdate.setDate(expirationdate.getDate() - 1);

    await User.deleteMany({
      isverified: false,
      createdAt:{$lt:expirationdate}
    });
    console.log('Cleanup job ran successfully');
  } catch (error) {
    console.error('Error running cleanup job:', error);
  }
});

