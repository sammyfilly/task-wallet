import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import Navbar from "@/components/shared/Navbar";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
const inter = Inter({ subsets: ["latin"] });
import "react-toastify/dist/ReactToastify.css";
import { getUser, useAuthStore } from "@/utils/zustand/authStore/useAuthStore";
import { motion } from "framer-motion";
import Link from "next/link";
import * as RxIcons from "react-icons/rx";
import * as TfiIcons from "react-icons/tfi";
import * as CiIcons from "react-icons/ci";
import * as AiIcons from "react-icons/ai";
import { useRealmStore } from "@/utils/zustand/realm/useRealmStore";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const pagesWithoutSidebar = ["/sign-up", "/login"];
  const [showSideBar, setShowSidebar] = useState(false);

  const authStore = useAuthStore((s) => s);

  const { currentRealm } = useRealmStore((s) => s);

  useEffect(() => {
    if (pagesWithoutSidebar.includes(router.pathname)) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [router.pathname]);

  useEffect(() => {
    getUser(authStore);
  }, []);

  const allIngredients = [
    { icon: <RxIcons.RxDashboard />, label: "Dashboard" },
    { icon: <TfiIcons.TfiWallet />, label: "Wallet" },
    { icon: <CiIcons.CiCircleList className="w-5 h-5" />, label: "Tasks" },
    { icon: <AiIcons.AiOutlineSetting />, label: "Settings" },
  ];

  const [tomato, lettuce, cheese, time] = allIngredients;
  const initialTabs = [lettuce, cheese, time];

  return (
    <main className="p-6 bg-bg-primary min-h-screen">
      <ToastContainer toastClassName={"bg-red-200"} theme="dark" />
      <div
        className={`flex rounded-2xl bg-bg-primary max-h-[calc(100vh-3rem)] min-h-[calc(100vh-3rem)] overflow-hidden text-text-primary  shadow-shadow-primary flex-col ${inter.className}`}
      >
        <Navbar />

        <div className="flex relative w-full min-h-full grow">
          {/* {showSideBar && <Sidebar />} */}
          <div className="grow flex flex-col overflow-scroll relative">
            <ul className="flex justify-evenly w-full border-b sticky shadow-shadow-form-input top-0 z-20 bg-bg-primary border-border-primary">
              {currentRealm &&
                initialTabs.map((item) => (
                  <Link
                    key={item.label}
                    className="w-full py-[10px] flex items-center gap-3 justify-center relative"
                    href={{
                      pathname: `/[realm]/${item.label.toLowerCase()}`,
                      query: { realm: currentRealm.name },
                    }}
                  >
                    {item.icon}
                    {item.label}
                    {router.pathname.includes(item.label.toLowerCase()) ? (
                      <motion.div
                        className="border-b-[2px] rounded-sm border-secondary absolute top-[calc(100%-1px)] w-full bg-red-100 h-[1px]"
                        layoutId="underline"
                      />
                    ) : null}
                  </Link>
                ))}
            </ul>
            <Component {...pageProps} />
          </div>
        </div>
      </div>
    </main>
  );
}
