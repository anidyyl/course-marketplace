import { useAccount, useAdmin } from "@components/hooks/web3";
import { Breadcrumbs } from "@components/ui/common";
import { EthRates, WalletBar } from "@components/ui/web3";
import { useEffect } from "react";

const DEFAULT_LINKS = [
  {
    href: "/marketplace",
    value: "Buy"
  },
  {
    href: "/marketplace/courses/owned",
    value: "My Courses"
  }
]

let links = []

export default function Header() {

  const { account } = useAccount()

  useEffect(() => {
    links = [...DEFAULT_LINKS]
    if (account.isAdmin) {
      links.push(
        {
          href: "/marketplace/courses/managed",
          value: "Managed Courses"
        })
    }
  }, [account])

  return (
    <>
      <div className="pt-4">
        <WalletBar />
      </div>
      <EthRates />
      <div className="flex flex-row-reverse p-4 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={links}/>
      </div>
    </>
  )
}