import { create } from "zustand";
import { Client, ID, Databases, Query } from "appwrite";
import { toast } from "react-toastify";
import { ITransaction, IWallteStore } from "./IWalletStore";

const client = new Client();
const database = new Databases(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
  .setProject("647dc841ab72fff2362b"); // Your project ID

export const useWalletStore = create<IWallteStore>((set) => ({
  balance: null,
  credit: null,
  debit: null,
  realm: null,
  id: null,
  transactions: null,
  filters: null,
  setTransactions: (transactions) => {
    set({ transactions });
  },
  setBalance: (balance, credit, debit, realm, id) => {
    set({ balance, realm, credit, debit, id });
  },
  isLoading: false,
  setisLoading: (isLoading) => {
    set({ isLoading });
  },
}));

export const getRealmBalance = async (input: {
  userId: string;
  realm: string;
  walletStore: IWallteStore;
}) => {
  try {
    input.walletStore.setisLoading(true);
    const res = await database.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID || "",
      process.env.NEXT_PUBLIC_WALLET_COLLECTION_ID || "",
      [Query.equal("userId", input.userId), Query.equal("realm", input.realm)]
    );
    if (res.total === 0) {
      createRealmWallet({
        userId: input.userId,
        realm: input.realm,
        walletStore: input.walletStore,
      });
    } else {
      console.log(res.documents);
      input.walletStore.setBalance(
        res.documents[0].balance,
        res.documents[0].credit,
        res.documents[0].debit,
        res.documents[0].realm,
        res.documents[0].$id
      );
    }
  } catch (error: any) {
    console.log(error);
    input.walletStore.setisLoading(false);
    toast.error(error?.message || "Something Went Wrong!");
  }
};

export const createRealmWallet = async (input: {
  userId: string;
  realm: string;
  walletStore: IWallteStore;
}) => {
  try {
    input.walletStore.setisLoading(true);
    const res = await database.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID || "",
      process.env.NEXT_PUBLIC_WALLET_COLLECTION_ID || "",
      ID.unique(),
      {
        userId: input.userId,
        realm: input.realm,
        balance: 0,
        credit: 0,
        debit: 0,
      }
    );

    input.walletStore.setBalance(res.balance, 0, 0, input.realm, res.$id);
    input.walletStore.setisLoading(false);
  } catch (error: any) {
    console.log(error);
    input.walletStore.setisLoading(false);
    toast.error(error?.message || "Something Went Wrong!");
  }
};

export const createTransaction = async (input: {
  transactionType: string;
  amount: number;
  date: string;
  userId: string;
  realm: string;
  method: string;
  walletStore: IWallteStore;
  onSuccess: () => void;
  description?: string;
  to?: string;
  from?: string;
}) => {
  try {
    input.walletStore.setisLoading(true);
    const {
      balance: currentBalance,
      credit: currentCredit,
      debit: currentDebit,
      id: walletId,
    } = input.walletStore;

    if (
      currentBalance === null ||
      currentCredit === null ||
      currentDebit === null ||
      walletId === null
    )
      return;

    const balance =
      input.transactionType === "Credit"
        ? currentBalance + Number(input.amount)
        : currentBalance - Number(input.amount);

    const creditType =
      input.transactionType === "Credit"
        ? { from: input.from }
        : { to: input.to };

    const debit =
      input.transactionType === "Credit"
        ? currentDebit
        : currentDebit + input.amount;

    const credit =
      input.transactionType === "Credit"
        ? currentCredit + input.amount
        : currentCredit;

    console.log(input.method.toLowerCase(), input.amount);

    const res = await database.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID || "",
      process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION_ID || "",
      ID.unique(),
      {
        date: input.date,
        amount: input.amount,
        userId: input.userId,
        realm: input.realm,
        type: input.transactionType.toLowerCase(),
        ...creditType,
        description: input.description || "",
        balance: balance,
        method: input.method.toLowerCase(),
      }
    );

    await database.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID || "",
      process.env.NEXT_PUBLIC_WALLET_COLLECTION_ID || "",
      walletId,
      {
        credit,
        balance: balance,
        debit,
      }
    );

    input.walletStore.setBalance(balance, credit, debit, input.realm, walletId);
    const newArray = [
      res as ITransaction,
      ...(input.walletStore.transactions || []),
    ];

    input.walletStore.setTransactions(newArray);
    console.log(res);
    input.onSuccess();
    input.walletStore.setisLoading(false);
  } catch (error: any) {
    console.log(error);
    input.walletStore.setisLoading(false);
    toast.error(error?.message || "Something Went Wrong!");
  }
};

export const getTransactions = async (input: {
  walletStore: IWallteStore;
  userId: string;
  realm: string;
  filters?: {
    transactionType?: string;
    transactionMedthod?: string;
    toDate?: string;
  };
}) => {
  try {
    const { realm, userId, walletStore, filters } = input;

    console.log(filters?.toDate);
    walletStore.setisLoading(true);
    const queryList = [
      Query.equal("userId", userId),
      Query.equal("realm", realm),
    ];
    filters?.transactionType &&
      queryList.push(Query.equal("type", filters?.transactionType));

    filters?.transactionMedthod &&
      queryList.push(Query.equal("method", filters.transactionMedthod));

    const date = filters?.toDate && new Date(filters?.toDate);

    const dateString = date && date.setDate(date.getDate() + 1);

    dateString &&
      queryList.push(
        Query.lessThan("date", new Date(dateString).toISOString())
      );

    const res = await database.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID || "",
      process.env.NEXT_PUBLIC_TRANSACTION_COLLECTION_ID || "",
      queryList
    );
    walletStore.setTransactions(res.documents as ITransaction[]);
    walletStore.setisLoading(false);
    console.log(res);
  } catch (error: any) {
    console.log(error);
    input.walletStore.setisLoading(false);
    toast.error(error?.message || "Something Went Wrong!");
  }
};