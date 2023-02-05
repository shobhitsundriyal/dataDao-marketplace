import { useContract } from '@/contexts/ContractContext'
import { useUser } from '@/contexts/UserContext'
import React, { useEffect, useState } from 'react'
import DatasetCard from './DatasetCard'
import Spinner from './Spinner'

const MyDatasets = ({ data }) => {
	const [myDatasetIds, setMyDatasetIds] = useState([])
	const { marketplace } = useContract()
	const { userAddress } = useUser()

	useEffect(() => {
		async function theFetch() {
			let tempData = await marketplace.getMyCreatedDatasets(userAddress)
			// console.log(tempData)
			setMyDatasetIds(tempData)
		}
		if (userAddress) theFetch()
	}, [userAddress])

	if (!myDatasetIds.length)
		return (
			<div className='ml-60 mt-32'>
				<Spinner />
			</div>
		)
	return (
		<div className='grid grid-cols-2 brp:grid-cols-3 gap-y-6 pt-5 pl-5 ml-16'>
			{myDatasetIds.map((item) => (
				<DatasetCard
					id={parseInt(item._hex, 16)}
					key={parseInt(item._hex, 16)}
				/>
			))}
		</div>
	)
}

export default MyDatasets
