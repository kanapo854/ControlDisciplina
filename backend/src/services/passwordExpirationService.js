const { User } = require('../models');
const { sendPasswordExpirationWarning, sendPasswordExpiredNotification } = require('../services/emailService');

const PASSWORD_EXPIRY_DAYS = 90;
const WARNING_DAYS = [7, 3, 1]; // Send warnings at 7, 3, and 1 days before expiration

/**
 * Check all users for password expiration
 * Should be run daily via cron job
 */
async function checkPasswordExpiration() {
  try {
    console.log('🔍 Checking password expiration...');
    
    const users = await User.findAll({
      where: {
        isActive: true,
        passwordExpired: false
      }
    });

    let warningsSent = 0;
    let expiredMarked = 0;

    for (const user of users) {
      if (!user.lastPasswordChange) {
        // If no lastPasswordChange, set it to now and skip
        user.lastPasswordChange = new Date();
        await user.save();
        continue;
      }

      const daysSinceChange = Math.floor(
        (Date.now() - new Date(user.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24)
      );

      const daysRemaining = PASSWORD_EXPIRY_DAYS - daysSinceChange;

      // Password has expired
      if (daysRemaining <= 0) {
        user.passwordExpired = true;
        await user.save();
        await sendPasswordExpiredNotification(user.email, user.name);
        expiredMarked++;
        console.log(`  ⚠️  Password expired for user: ${user.email}`);
        continue;
      }

      // Send warning if approaching expiration
      if (WARNING_DAYS.includes(daysRemaining)) {
        await sendPasswordExpirationWarning(user.email, user.name, daysRemaining);
        warningsSent++;
        console.log(`  📧 Warning sent to ${user.email} (${daysRemaining} days remaining)`);
      }
    }

    console.log(`✅ Password expiration check completed`);
    console.log(`   - Users checked: ${users.length}`);
    console.log(`   - Warnings sent: ${warningsSent}`);
    console.log(`   - Passwords expired: ${expiredMarked}`);

    return {
      usersChecked: users.length,
      warningsSent,
      expiredMarked
    };

  } catch (error) {
    console.error('❌ Error checking password expiration:', error);
    throw error;
  }
}

/**
 * Start scheduled password expiration checks
 * Runs daily at 2 AM
 */
function startPasswordExpirationScheduler() {
  const HOUR = 2; // 2 AM
  const MINUTE = 0;
  
  // Calculate milliseconds until next 2 AM
  const now = new Date();
  const nextRun = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    HOUR,
    MINUTE,
    0,
    0
  );
  
  // If it's already past 2 AM today, schedule for tomorrow
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  const msUntilNextRun = nextRun.getTime() - now.getTime();
  
  console.log(`⏰ Password expiration scheduler started`);
  console.log(`   Next run: ${nextRun.toLocaleString()}`);
  
  // Schedule first run
  setTimeout(() => {
    checkPasswordExpiration().catch(console.error);
    
    // Then run every 24 hours
    setInterval(() => {
      checkPasswordExpiration().catch(console.error);
    }, 24 * 60 * 60 * 1000); // 24 hours
    
  }, msUntilNextRun);
}

module.exports = {
  checkPasswordExpiration,
  startPasswordExpirationScheduler
};
