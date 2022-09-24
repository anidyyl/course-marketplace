import { useHooks } from "@components/providers/web3"
import { useEffect } from "react"
import { useWeb3 } from "@components/providers/web3"
import { Router, useRouter } from "next/router"

const _isEmpty = data => {
  return (
    data == null ||
    data == "" ||
    (Array.isArray(data) && data.length === 0) ||
    (data.constructor === Object && Object.keys(data).length === 0)
  )
}

const enhanceHook = swrRes => {
  const { data, error } = swrRes
  const hasInitialResponse = !!(data || error)
  const isEmpty = hasInitialResponse && _isEmpty(data)
  
  return {
    ...swrRes,
    isEmpty,
    hasInitialResponse
  }
}

export const useAccount = () => {
  return {account: enhanceHook(useHooks(hooks => hooks.useAccount)())}
}

export const useAdmin = ({redirectTo}) => {
  const { account } = useAccount()
  const { requireInstall } = useWeb3()
  const router = useRouter()

  useEffect(() => {
    if ( 
      requireInstall || 
      account.hasInitialResponse && !account.isAdmin || 
      account.isEmpty) {
        router.push(redirectTo)
      }
    }, [account])
  return { account }
}

export const useNetwork = () => {
  return {network: enhanceHook(useHooks(hooks => hooks.useNetwork)())}
}

export const useOwnedCourses = (...args) => {
  return {ownedCourses: enhanceHook(useHooks(hooks => hooks.useOwnedCourses)(...args))}
}

export const useOwnedCourse = (...args) => {
  return {ownedCourse: enhanceHook(useHooks(hooks => hooks.useOwnedCourse)(...args))}
}

export const useManagedCourses = (...args) => {
  return {managedCourses: enhanceHook(useHooks(hooks => hooks.useManagedCourses)(...args))}
}

export const useWalletInfo = () => {
  const { account } = useAccount()
  const { network } = useNetwork()

  const isConnecting = !account.hasInitialResponse && !network.hasInitialResponse
  
  const hasConnectedWallet = !!(account.data && network.isSupported)

  return {
    account,
    network,
    isConnecting,
    hasConnectedWallet
  }
}
