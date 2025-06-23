import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Option } from "@/app/utils/categories";

export const getStatus = async (): Promise<Option[]> => {
  const q = query(collection(db, "transaction_status"));
  const querySnapshot = await getDocs(q);

  const status: Option[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    status.push({
      value: doc.id,
      label: data.name,
    });
  });

  return status;
};


export const getStatusArray = async (): Promise<string[]> => {
  const q = query(collection(db, "transaction_status"));
  const querySnapshot = await getDocs(q);

  const status: string[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    status.push(data.name);
  });

  return status;
};
