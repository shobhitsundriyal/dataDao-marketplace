import { useUser } from '@/contexts/UserContext'
import Image from 'next/image'
import Link from 'next/link'
import logo from '../assets/logo.png'
import { useAccount, useConnect } from 'wagmi'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const Header = () => {
	const { userAddress, setUser } = useUser()
	const { connect, connectors, error, isLoading, pendingConnector } =
		useConnect()
	const router = useRouter()

	const { address, isConnected } = useAccount()
	useEffect(() => {
		if (isConnected) {
			setUser(address)
		}
	}, [isConnected])

	return (
		<div className='sticky top-0 z-10'>
			<header className='flex items-center justify-between p-4 text-white bg-transparent backdrop-blur-md border-b-2 border-[#3d3f48]'>
				<Link href={'/'}>
					<div className='flex items-center cursor-pointer'>
						<div className='w-10 h-10 mr-4 flex items-center overflow-hidden rounded-r-md  '>
							<Image
								src={logo}
								alt='Logo'
								className='w-9 h-10 scale-150 translate-x-[0.35rem]'
							/>
						</div>
						<h2 className=' font-semibold text-xl'>Data Champion</h2>
					</div>
				</Link>
				<nav className='flex items-center'>
					<button
						href='#'
						className='mr-4 btn btn-ghost'
						onClick={() => router.push('/explore')}
					>
						Explore Datasets
					</button>
					{/* <a href='#' className='mr-6'>
						Link 2
					</a> */}
					{userAddress ? (
						<button
							className='btn btn-primary'
							onClick={() => router.push({ pathname: `/dashboard` })}
						>
							Dashboard{' '}
							<svg
								width='24'
								height='21'
								xmlns='http://www.w3.org/2000/svg'
								fillRule='evenodd'
								clipRule='evenodd'
								className='ml-2'
							>
								<path d='M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z' />
							</svg>
						</button>
					) : (
						<button
							className={`btn btn-primary ${isLoading && 'loading'}`}
							onClick={() => connect({ connector: connectors[0] })}
						>
							Connect wallet
						</button>
					)}
				</nav>
			</header>
			{/* <div className='divider my-0'></div> */}
		</div>
	)
}

export default Header
