import DatasetCard from '@/components/DatasetCard'
import { useContract } from '@/contexts/ContractContext'
import React, { useEffect, useState } from 'react'
import lodash from 'lodash'

const explore = () => {
	//get all datasets
	const { marketplace } = useContract()
	const [total, setTotal] = useState(0)

	useEffect(() => {
		if (marketplace) {
			async function getData() {
				const latestId = await marketplace.latestDataId()
				setTotal(parseInt(latestId._hex, 16))
			}
			getData()
		}
	}, [marketplace])

	return (
		<div className='grid grid-cols-3 brp:grid-cols-4 gap-y-6 pt-5 pl-5'>
			{lodash.times(total, lodash.constant(null)).map((item, index) => (
				<DatasetCard id={index + 1} key={index} />
			))}
		</div>
	)
}

export default explore
