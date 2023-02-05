import { providers, Contract } from 'ethers'
import { contractAddress, contractAbi } from 'contracts/contractDetails'
import { createContext, useContext } from 'react'

const ContractContext = createContext()

export const ContractContextProvider = ({ children }) => {
	const provider = new providers.JsonRpcProvider('http://localhost:8545')
	const signer = provider.getSigner()
	const marketplace = new Contract(contractAddress, contractAbi, signer)

	return (
		<>
			<ContractContext.Provider value={{ marketplace }}>
				{children}
			</ContractContext.Provider>
		</>
	)
}

export const useContract = () => useContext(ContractContext)
