import { useEffect } from "react"
import useSWR from "swr"

const adminAddresses = {
  "0xe3b6d5d3be1ccd7221ad2dd7ce601e0274c01b07069a6dee5953012202770c06": true,
  "0x70c4db76a8bf9b40d430de334a730a81061eae5eb0fa0cd1575510d343248736": true
}

export const handler = (web3, provider) => () => {
  // const [account, setAccount] = useState(null)

  const { data, mutate, ...rest } = useSWR(() => 
    web3 ? "web3/accounts" : null,
    async () => {
      const accounts = await web3.eth.getAccounts()
      const account = accounts[0]
      if (!account) {
        throw new Error("Cannot retrieve an account. Please refresh the browser")
      }
      return account
    }
  )
  
  // useEffect(() => {
  //   const getAcount = async () => {
  //     const accounts = await web3.eth.getAccounts()
  //     setAccount(accounts[0])
  //   }
  //   web3 && getAcount()
  // }, [web3])

  useEffect(() => {
    const mutator = accounts => mutate(accounts[0] ?? null)
    provider?.on("accountsChanged", mutator)
    
    return () => {
      provider?.removeListener("accountsChanged", mutator)
    }
  }, [provider])

  return { 
    data,
    isAdmin: (data && adminAddresses[web3.utils.keccak256(data)]) ?? false,
    mutate, 
    ...rest
  }
}