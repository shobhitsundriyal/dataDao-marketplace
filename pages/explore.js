import DatasetCard from '@/components/DatasetCard'
import React from 'react'

const explore = () => {
	//get all datasets
	return (
		<div className='grid grid-cols-3 brp:grid-cols-4 gap-y-6 pt-5 pl-5'>
			<DatasetCard id={1} />
			<DatasetCard />
			<DatasetCard />
			<DatasetCard />
			<DatasetCard /> <DatasetCard />
			<DatasetCard />
			<DatasetCard />
			<DatasetCard /> <DatasetCard />
			<DatasetCard />
			<DatasetCard />
			<DatasetCard />
		</div>
	)
}

export default explore
