const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

const COMMISSION_RATE = 0.15;
const SERVICE_FEE_DEFAULT = 50;

// When a task status becomes 'completed'
exports.onTaskCompleted = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== 'completed' && after.status === 'completed') {
      const taskId = context.params.taskId;
      const price = after.price || 0;
      const clientId = after.clientId;
      const taskerId = after.taskerId;
      const serviceFee = after.serviceFee ?? SERVICE_FEE_DEFAULT;
      const commission = Number((price * COMMISSION_RATE).toFixed(2));
      const totalPaid = price + serviceFee;

      // Create payment record
      const paymentRef = db.collection('payments').doc();
      await paymentRef.set({
        taskId, 
        clientId, 
        taskerId,
        amount: totalPaid,
        escrowHeld: false,
        status: 'released',
        method: after.paymentMethod || 'unknown',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        releasedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create transaction records
      const txBatch = db.batch();
      
      // Commission income
      const commissionTx = db.collection('transactions').doc();
      txBatch.set(commissionTx, {
        type: 'commission',
        amount: commission,
        sourceId: taskId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Service fee income
      const serviceFeeTx = db.collection('transactions').doc();
      txBatch.set(serviceFeeTx, {
        type: 'service_fee',
        amount: serviceFee,
        sourceId: taskId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Tasker payout
      const payoutTx = db.collection('transactions').doc();
      txBatch.set(payoutTx, {
        type: 'payout',
        amount: (price - commission) * -1, // Negative for payout
        sourceId: taskId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      await txBatch.commit();

      // Update user ratings and stats (simplified)
      await updateUserStats(taskerId, price - commission);
    }
    return null;
  });

async function updateUserStats(userId, earnings) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (userDoc.exists) {
    const userData = userDoc.data();
    const totalEarnings = (userData.totalEarnings || 0) + earnings;
    const completedTasks = (userData.completedTasks || 0) + 1;
    
    await userRef.update({
      totalEarnings,
      completedTasks,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

// Daily earnings aggregation
exports.dailyEarningsAggregator = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Asia/Manila')
  .onRun(async (context) => {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const txSnap = await db.collection('transactions')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(start))
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(end))
      .get();

    let commissionIncome = 0;
    let serviceFeeIncome = 0;
    let subscriptionIncome = 0;
    let featuredIncome = 0;
    
    txSnap.forEach(doc => {
      const data = doc.data();
      if (data.type === 'commission') commissionIncome += data.amount;
      if (data.type === 'service_fee') serviceFeeIncome += data.amount;
      if (data.type === 'subscription') subscriptionIncome += data.amount;
      if (data.type === 'featured') featuredIncome += data.amount;
    });

    const totalIncome = commissionIncome + serviceFeeIncome + subscriptionIncome + featuredIncome;
    const dayKey = start.toISOString().slice(0, 10);

    await db.collection('earnings_summary').doc(`daily_${dayKey}`).set({
      period: dayKey,
      type: 'daily',
      commissionIncome,
      serviceFeeIncome,
      subscriptionIncome,
      featuredIncome,
      totalIncome,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return null;
  });

// Monthly aggregation (runs on 1st of every month)
exports.monthlyEarningsAggregator = functions.pubsub
  .schedule('0 0 1 * *')
  .timeZone('Asia/Manila')
  .onRun(async (context) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailySnap = await db.collection('earnings_summary')
      .where('period', '>=', start.toISOString().slice(0, 10))
      .where('period', '<', end.toISOString().slice(0, 10))
      .where('type', '==', 'daily')
      .get();

    let commissionIncome = 0;
    let serviceFeeIncome = 0;
    let subscriptionIncome = 0;
    let featuredIncome = 0;
    
    dailySnap.forEach(doc => {
      const data = doc.data();
      commissionIncome += data.commissionIncome;
      serviceFeeIncome += data.serviceFeeIncome;
      subscriptionIncome += data.subscriptionIncome;
      featuredIncome += data.featuredIncome;
    });

    const totalIncome = commissionIncome + serviceFeeIncome + subscriptionIncome + featuredIncome;
    const monthKey = start.toISOString().slice(0, 7);

    await db.collection('earnings_summary').doc(`monthly_${monthKey}`).set({
      period: monthKey,
      type: 'monthly',
      commissionIncome,
      serviceFeeIncome,
      subscriptionIncome,
      featuredIncome,
      totalIncome,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return null;
  });

// User registration handler
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  const userData = {
    uid: user.uid,
    email: user.email,
    name: user.displayName || 'User',
    avatarUrl: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}`,
    role: 'user',
    kyc_status: 'pending',
    rating: 0,
    reviews: 0,
    completedTasks: 0,
    totalEarnings: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('users').doc(user.uid).set(userData);
  return null;
});