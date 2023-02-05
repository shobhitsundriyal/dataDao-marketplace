import { useRouter } from 'next/router'
import { useContract } from '@/contexts/ContractContext'
import React, { useEffect } from 'react'

const DatasetCard = ({ img, title, desc, id }) => {
	const router = useRouter()

	useEffect(() => {
		async function getTitleDescription() {}
	})

	return (
		<div
			className=' border-2 h-[16rem] aspect-4/3 overflow-hidden rounded-lg cursor-pointer'
			onClick={() => router.push(`/dataset/${id}`)}
		>
			<img
				src='https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/640px-Image_created_with_a_mobile_phone.png'
				alt=''
				className=' object-fill w-full h-[50%]'
			/>
			<div className=' text-white mt-2 font-bold text-xl ml-2 mr-2'>
				{' '}
				the title
			</div>
			<div className=' text-white mt-2 ml-2 mr-2 text-clip line-clamp-3'>
				{' '}
				sdgfdkjh jdfgbsdfgksdjfbskjdfbh fhksdh kshdkfh skhfsdhf sdhf sdhfskhs
				khdh hdfk shdfhs khfsdhf kshdfkshdfkh khsdk hsdkhf shdk{' '}
			</div>
		</div>
	)
}

export default DatasetCard
