import heroImg from '../assets/hero.png'
import Header from '@/components/Header'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useUser } from '@/contexts/UserContext'

const Home = () => {
	const router = useRouter()
	const { userAddress } = useUser()
	return (
		<div className='hero h-[80vh]'>
			<div className='hero-content flex-col lg:flex-row-reverse'>
				<Image
					src={heroImg}
					className='max-w-sm rounded-lg scale-125'
					alt='heroImage'
				/>
				<div className=' grid grid-flow-row gap-10'>
					<h1 className='text-5xl font-bold'>Data Champion</h1>
					<p className='py-6 font-mono'>
						Your ultimate solution for managing and exchanging multimedia data.
						Whether you're a business looking to store, organize, and distribute
						your multimedia files or an individual seeking a secure platform to
						store your media collection, Data Champion has got you covered. With
						its user-friendly interface and advanced security features, you can
						easily upload, store, and share your multimedia data with ease. The
						marketplace also enables users to buy and sell multimedia data,
						creating a one-stop solution for all your multimedia needs. So, why
						wait? Sign up for Data Champion today and experience the future of
						multimedia data management and exchange
					</p>
					<button
						className='btn btn-primary w-max'
						onClick={() => userAddress && router.push('/dashboard')}
					>
						Get Started
					</button>
				</div>
			</div>
		</div>
	)
}

export default Home
