import { collection, query, getDocs, onSnapshot, addDoc, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Option } from "@/app/utils/categories";
import { Account, AddAccount } from "../types/Account";

export const getAccounts = async (user_id: string): Promise<Option[]> => {
  const q = query(collection(db, "transaction_account"), where("user_id", "==", user_id));
  const querySnapshot = await getDocs(q);

  const accounts: Option[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    accounts.push({
      value: doc.id,
      label: data.name,
    });
  });

  return accounts;
};

export const getAccountsArray = async (user_id: string): Promise<string[]> => {
  const q = query(collection(db, "transaction_account"), where("user_id", "==", user_id));
  const querySnapshot = await getDocs(q);

  const accounts: string[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    accounts.push(data.name);
  });

  return accounts;
};

export const listenToAllAccounts = (
  user_id: string,
  onUpdate: (accounts: Account[]) => void
) => {
  const q = query(collection(db, "transaction_account"), where("user_id", "==", user_id));

  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    const accounts = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data.name,
          institution: data.institution,
          color: data.color,
          transactions: data.transactions,
        };
      })
    );

    onUpdate(accounts);
  });

  return unsubscribe;
};

export const addAccount = async (account: AddAccount) => {
  const docRef = await addDoc(collection(db, "transaction_account"), account);
  return docRef;
};

export const deleteAccount = async (accountId: string) => {
  const docRef = await deleteDoc(doc(db, "transaction_account", accountId));
  return docRef;
};

export const updateAccount = async (accountId: string, data: AddAccount) => {
  const docRef = doc(db, "transaction_account", accountId);
  const formattedData = {
    ...data,
  }
  await updateDoc(docRef, formattedData);

  return docRef;
};
