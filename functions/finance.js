const functions = require("firebase-functions");
const { db, admin } = require("./admin");

exports.transactionAdded = functions
  .firestore
  .document('transactions/{transactionId}')
  .onWrite(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const { transactionId } = context.params;
    if (change.after.exists && after && !before) {
      const accountId = after.account
      try {
        const accountRef = db.doc(`accounts/${accountId}`);
        const transactionRef = change.after.ref;
        await db.runTransaction(async (transaction) => {
          const accountDoc = await transaction.get(accountRef)
          if (!accountDoc.exists) {
              throw "Account does not exist!";
          }
          const account = accountDoc.data();
          if(after.type === "income") {
            console.log(`income transaction added, updating account balance to ${accountId} with amount ${after.amount}`);
            transaction.update(transactionRef, {
              status: "successful",
              balanceBefore: account.balance,
              balanceAfter: account.balance + after.amount
            })
            transaction.update(accountRef, {
              balance: addNumbersFixed(account.balance, after.amount),
              lastTransactionAt: admin.firestore.FieldValue.serverTimestamp(),
            })
          }
          else if(after.type === "expense") {
            console.log(`expense transaction added, updating account balance to ${accountId} with amount ${after.amount}`);
            transaction.update(transactionRef, {
              status: "successful",
              balanceBefore: account.balance,
              balanceAfter: account.balance - after.amount
            })
            transaction.update(accountRef, {
              balance: addNumbersFixed(account.balance, -after.amount),
              lastTransactionAt: admin.firestore.FieldValue.serverTimestamp(),  
            })
          }
          else if(after.type === "transfer") {
            console.log(`transfer transaction added, updating account balance to ${accountId} with ${after.toAccount} with amount ${after.amount}`);
            const targetAccountDoc = await transaction.get(db.doc(`accounts/${after.toAccount}`));
            const targetAccount = targetAccountDoc.data();
            transaction.update(transactionRef, {
              balanceBefore: account.balance,
              balanceAfter: addNumbersFixed(account.balance, -after.amount),
              description: `💵 Funds Transfer from ${account.accountName} to ${targetAccountDoc.data().accountName}`,
              status: "successful",
            })
            transaction.update(accountRef, {
              balance: addNumbersFixed(account.balance, -after.amount),
              lastTransactionAt: admin.firestore.FieldValue.serverTimestamp(),
            })
            transaction.update(db.doc(`accounts/${after.toAccount}`), {
              balance: addNumbersFixed(targetAccount.balance, after.amount),
              lastTransactionAt: admin.firestore.FieldValue.serverTimestamp(),
            })
          }
        });
      } catch (error) {
        console.log(error);
        db.doc(`transactions/${transactionId}`).update({
          status: 'failed'
        })
      }
    }
  });

const addNumbersFixed = (num1, num2) => {
  return +(num1 + num2).toFixed(2);
}