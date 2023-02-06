import ModalUpload from '@/components/ModalUpload'
import MyDatasets from '@/components/MyDatasets'
import MyPurchased from '@/components/MyPurchased'
import { useContract } from '@/contexts/ContractContext'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const dashboard = () => {
	const [activeOption, setActiveOption] = useState(0)
	const router = useRouter()
	const { userAddress } = useUser()
	const [openModal, setOpenModel] = useState(false)

	useEffect(() => {
		if (!userAddress) {
			// router.push('/')
		}
	}, [])
	return (
		<div className='drawer-side border-r-2 flex -mt-1'>
			{/* Side bar  */}
			<div className='bg-base-300 rounded-r-lg'>
				<label htmlFor='my-drawer-2' className='drawer-overlay'></label>
				<ul className='menu w-60 text-base-content bg-base-300 min-h-[90vh] sticky top-20 flex flex-col'>
					{/* <!-- Sidebar content here --> */}
					<li>
						<a
							className={`${activeOption === 0 && 'bg-[#37383f]'}`}
							onClick={() => setActiveOption(0)}
						>
							My Datasets
						</a>
					</li>
					<li>
						<a
							className={`${activeOption === 1 && 'bg-[#37383f]'}`}
							onClick={() => setActiveOption(1)}
						>
							My Purchased dataset
						</a>
					</li>
					<div className='px-8 bottom-2 grow flex items-end justify-center'>
						<label htmlFor='my-modal-3' className='btn btn-secondary mb-10'>
							+ Create new dataset
						</label>
					</div>
				</ul>
			</div>

			{/* right side data  */}
			<div className='w-[100%]'>
				{activeOption ? <MyPurchased /> : <MyDatasets />}
			</div>

			<ModalUpload />
		</div>
	)
}

export default dashboard
