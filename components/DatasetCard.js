import { useRouter } from 'next/router'
import { useContract } from '@/contexts/ContractContext'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { lighthouseConstants } from '@/constants'
import Image from 'next/image'

const DatasetCard = ({ img, title, desc, id }) => {
	const router = useRouter()
	const { marketplace } = useContract()
	const [details, setDetails] = useState({})

	useEffect(() => {
		async function getTitleDescription() {
			const metadataHash = await marketplace.datasetMetaDateFile(parseInt(id))
			if (metadataHash) {
				const metadataResp = await axios.get(
					lighthouseConstants.lighthouseGateway + '/ipfs/' + metadataHash
				)
				// const metadata
				setDetails(metadataResp.data)
			}
		}
		getTitleDescription()
	}, [])

	return (
		<div
			className=' border-2 h-[16rem] aspect-4/3 overflow-hidden rounded-lg cursor-pointer'
			onClick={() => router.push(`/dataset/${id}`)}
		>
			<Image
				src={`${
					details.coverImageCid
						? lighthouseConstants.lighthouseGateway +
						  '/ipfs/' +
						  details.coverImageCid
						: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/640px-Image_created_with_a_mobile_phone.png'
				}`}
				alt=''
				className=' object-fill w-full h-[50%]'
				width={200}
				height={100}
			/>
			<div className=' text-white mt-2 font-bold text-xl ml-2 mr-2'>
				{' '}
				{details.title ? details.title : 'the title'}
			</div>
			<div className=' text-white mt-2 ml-2 mr-2 text-clip line-clamp-3'>
				{' '}
				{details.description
					? details.description
					: 'sdgfdkjh jdfgbsdfgksdjfbskjdfbh fhksdh kshdkfh skhfsdhf sdhf sdhfskhs khdh hdfk shdfhs khfsdhf kshdfkshdfkh khsdk hsdkhf shdk'}{' '}
			</div>
		</div>
	)
}

export default DatasetCard
