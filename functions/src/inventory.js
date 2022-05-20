const functions = require("firebase-functions");
const { db, admin } = require("./admin");

exports.inventoryUpdate = functions
    .firestore
    .document('inventory/{id}')
    .onWrite(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const id = context.params.id;
        
        if(change.after.exists) { 
            //check if parent has changed
            if(before.parent !== after.parent) {
                //remove from old parent
                if(before.parent != null) await db.collection('inventory').doc(before.parent).update({
                    children: admin.firestore.FieldValue.increment(-1)
                })
                //add to new parent
                if(after.parent != null) await db.collection('inventory').doc(after.parent).update({
                    children: admin.firestore.FieldValue.increment(1)
                })
            }
        }
    });