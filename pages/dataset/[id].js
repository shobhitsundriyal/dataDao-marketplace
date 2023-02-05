import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

const DatasetPage = () => {
	const router = useRouter()
	const datasetId = router.query.id

	useEffect(() => {
		//fetch
	}, [])

	if (!Number(datasetId)) return <div> this data don't exist</div>

	return <div>{datasetId}</div>
}

export default DatasetPage
