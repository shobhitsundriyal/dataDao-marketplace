import React, { useEffect, useState } from 'react'
import { useContract } from '@/contexts/ContractContext'
import DatasetCard from './DatasetCard'
import { useUser } from '@/contexts/UserContext'
import Spinner from './Spinner'

const MyPurchased = () => {
	const [myPurchasedDatasetIds, setMyPurchasedDatasetIds] = useState([])
	const { marketplace } = useContract()
	const { userAddress } = useUser()

	useEffect(() => {
		async function theFetch() {
			let tempData = await marketplace.getMyPurchasedDatasets(userAddress)
			// console.log(tempData)
			setMyPurchasedDatasetIds(tempData)
		}
		if (userAddress) theFetch()
	}, [userAddress])

	if (!myPurchasedDatasetIds.length)
		return (
			<div className='ml-60 mt-32'>
				<Spinner />
			</div>
		)

	return (
		<div className='grid grid-cols-2 brp:grid-cols-3 gap-y-6 pt-5 pl-5 ml-16'>
			{myPurchasedDatasetIds.map((item) => (
				<DatasetCard
					id={parseInt(item._hex, 16)}
					key={parseInt(item._hex, 16)}
				/>
			))}
		</div>
	)
}

export default MyPurchased
