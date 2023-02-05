import Header from '@/components/Header'
import { UserContextProvider, useUser } from '@/contexts/UserContext'
import '@/styles/globals.css'
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { ContractContextProvider } from '@/contexts/ContractContext'

const { chains, provider, webSocketProvider } = configureChains(
	[polygonMumbai],
	[publicProvider()]
)

const client = createClient({
	autoConnect: true,
	connectors: [new MetaMaskConnector({ chains })],
	provider,
	webSocketProvider,
})

export default function App({ Component, pageProps }) {
	return (
		<UserContextProvider>
			<WagmiConfig client={client}>
				<ContractContextProvider>
					<Header />
					<Component {...pageProps} />
				</ContractContextProvider>
			</WagmiConfig>
		</UserContextProvider>
	)
}
