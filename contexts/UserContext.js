import { createContext, useContext, useState } from 'react'

const UserContext = createContext()

export const UserContextProvider = ({ children }) => {
	const [userAddress, setUserAddress] = useState()
	const [userJWT, setUserJWT] = useState()

	const setUser = (address = null, jwtToken = null) => {
		if (address) setUserAddress(address)
		if (jwtToken) setUserJWT(jwtToken)
	}

	return (
		<>
			<UserContext.Provider value={{ userAddress, userJWT, setUser }}>
				{children}
			</UserContext.Provider>
		</>
	)
}

export const useUser = () => useContext(UserContext)
