import { collection, query, where, onSnapshot, DocumentReference, getDoc, addDoc, deleteDoc, doc, updateDoc, increment, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Transaction, AddTransaction } from "@/app/types/transaction";

export const listenToTransactionsByUserId = (
  userId: string,
  onUpdate: (transactions: Transaction[]) => void
) => {
  const q = query(collection(db, "transaction"), where("user_id", "==", userId));

  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    const transactions = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Asegura que las referencias sean válidas
        const categoryRef = data.category as DocumentReference;
        const accountRef = data.account as DocumentReference;
        const statusRef = data.status as DocumentReference;

        const [categorySnap, accountSnap, statusSnap] = await Promise.all([
          categoryRef ? getDoc(categoryRef) : null,
          accountRef ? getDoc(accountRef) : null,
          statusRef ? getDoc(statusRef) : null,
        ]);

        const category = categorySnap?.exists() ? { value: categorySnap.id, label: categorySnap.data().name} : null;
        const account = accountSnap?.exists() ? { value: accountSnap.id, label: accountSnap.data().name, institution: accountSnap.data().institution, color: accountSnap.data().color} : null;
        const status = statusSnap?.exists() ? { value: statusSnap.id, label: statusSnap.data().name} : null;

        return {
          id: doc.id,
          date: data.date.toDate(),
          description: data.description,
          category: category,
          account: account,
          status: status,
          type: data.type,
          amount: data.amount,
          user_id: data.user_id,
        };
      })
    );

    onUpdate(transactions);
  });

  return unsubscribe;
};

export const addTransaction = async (transaction: AddTransaction) => {
  const docRef = await addDoc(collection(db, "transaction"), transaction);
  // Incrementa el campo "transactions" en la categoría correspondiente
  if (transaction.category) {
    await updateDoc(transaction.category, {
      transactions: increment(1),
    });
  }
  // Incrementa el campo "transactions" en la cuenta correspondiente
  if (transaction.account) {
    await updateDoc(transaction.account, {
      transactions: increment(1),
    });
  }
  return docRef;
};

export const deleteTransaction = async (transactionId: string, categoryId: string, accountId: string) => {
  const docRef = await deleteDoc(doc(db, "transaction", transactionId));
  // Decrementa el campo "transactions" en la categoría correspondiente
  await updateDoc(doc(db, "transaction_category/" + categoryId), {
    transactions: increment(-1),
  })
  // Decrementa el campo "transactions" en la cuenta correspondiente
  await updateDoc(doc(db, "transaction_account/" + accountId), {
    transactions: increment(-1),
  })
  return docRef;
};

export const updateTransaction = async (data: Transaction, categoryId: string | undefined, accountId: string | undefined) => {
  const docRef = doc(db, "transaction", data.id);
  const formattedData = {
    ...data,
    category: doc(db, "transaction_category/" + data.category?.value),
    account: doc(db, "transaction_account/" + data.account?.value),
    status: doc(db, "transaction_status/" + data.status?.value),
  }
  await updateDoc(docRef, formattedData);
  // Si la categoría ha cambiado, actualiza el campo "transactions" en la categoría anterior y en la nueva categoría
  if (categoryId !== data.category?.value) {
    await updateDoc(doc(db, "transaction_category/" + categoryId), {
      transactions: increment(-1),
    })
    await updateDoc(doc(db, "transaction_category/" + data.category?.value), {
      transactions: increment(1),
    })
  }
  // Si la cuenta ha cambiado, actualiza el campo "transactions" en la cuenta anterior y en la nueva cuenta
  if (accountId !== data.account?.value) {
    await updateDoc(doc(db, "transaction_account/" + accountId), {
      transactions: increment(-1),
    })
    await updateDoc(doc(db, "transaction_account/" + data.account?.value), {
      transactions: increment(1),
    })
  }
  return docRef;
};

export const getLatestTransactions = async (
  userId: string,
  onUpdate: (transactions: Transaction[]) => void
) => {
  const q = query(collection(db, "transaction"), where("user_id", "==", userId), orderBy("date", "desc"), limit(5));

  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    const transactions = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Asegura que las referencias sean válidas
        const categoryRef = data.category as DocumentReference;
        const accountRef = data.account as DocumentReference;
        const statusRef = data.status as DocumentReference;

        const [categorySnap, accountSnap, statusSnap] = await Promise.all([
          categoryRef ? getDoc(categoryRef) : null,
          accountRef ? getDoc(accountRef) : null,
          statusRef ? getDoc(statusRef) : null,
        ]);

        const category = categorySnap?.exists() ? { value: categorySnap.id, label: categorySnap.data().name} : null;
        const account = accountSnap?.exists() ? { value: accountSnap.id, label: accountSnap.data().name} : null;
        const status = statusSnap?.exists() ? { value: statusSnap.id, label: statusSnap.data().name} : null;

        return {
          id: doc.id,
          date: data.date.toDate(),
          description: data.description,
          category: category,
          account: account,
          status: status,
          type: data.type,
          amount: data.amount,
          user_id: data.user_id,
        };
      })
    );

    onUpdate(transactions);
  });

  return unsubscribe;
};