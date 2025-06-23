import { collection, query, getDocs, onSnapshot, addDoc, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AddCategory, Category } from "../types/Category";

export interface Option {
  value: string;
  label: string;
  institution?: string;
  color?: string;
}

export const getCategories = async (user_id: string): Promise<{ income: Option[]; expense: Option[] }> => {
  const q = query(collection(db, "transaction_category"), where("user_id", "==", user_id));
  const querySnapshot = await getDocs(q);

  const income: Option[] = [];
  const expense: Option[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    if (data.type === "income") {
      income.push({
        value: doc.id,
        label: data.name,
      });
    } else if (data.type === "expense") {
      expense.push({
        value: doc.id,
        label: data.name,
      });
    }
  });

  return {
    income,
    expense,
  };
};

export const getCategoriesArray = async (user_id: string): Promise<string[]> => {
  const q = query(collection(db, "transaction_category"), where("user_id", "==", user_id));
  const querySnapshot = await getDocs(q);

  const categories: string[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    categories.push(data.name);
  });

  return categories;
};

export const listenToAllCategories = (
  user_id: string,
  onUpdate: (categories: Category[]) => void
) => {
  const q = query(collection(db, "transaction_category"), where("user_id", "==", user_id));

  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    const categories = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          icon: data.icon,
          color: data.color,
          transactions: data.transactions,
          user_id: data.user_id
        };
      })
    );

    onUpdate(categories);
  });

  return unsubscribe;
};

export const addCategory = async (categorie: AddCategory) => {
  const docRef = await addDoc(collection(db, "transaction_category"), categorie);
  return docRef;
};

export const deleteCategory = async (categoryId: string) => {
  const docRef = await deleteDoc(doc(db, "transaction_category", categoryId));
  return docRef;
};

export const updateCategory = async (categoryId: string, data: AddCategory) => {
  const docRef = doc(db, "transaction_category", categoryId);
  const formattedData = {
    ...data,
  }
  await updateDoc(docRef, formattedData);

  return docRef;
};
