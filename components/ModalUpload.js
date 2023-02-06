import React, { useState } from 'react'
import Spinner from './Spinner'
import { uploadText } from '@lighthouse-web3/sdk'
import { useContract } from '@/contexts/ContractContext'

const ModalUpload = () => {
	const [step, setStep] = useState(1)
	const [metadata, setMetadata] = useState({ title: '', description: '' })
	const [metadataCid, setMetadataCid] = useState()
	const [datasetId, setDatasetId] = useState()
	let loading = false
	const { marketplace } = useContract()

	const handleSteps = async () => {
		loading = true
		debugger
		if (step === 1) {
			//get cid for metadata
			const metadataHash = await uploadText(
				JSON.stringify(metadata),
				process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY
			)
			// console.log(metadataHash)
			setMetadataCid(metadataHash)

			// also create data slot
			const dataId = await marketplace.createDatasetSlot()
			console.log(dataId)
			setDatasetId(dataId)
		} else if (step === 2) {
		}

		setStep((prev) => (prev < 3 ? prev + 1 : prev))
		loading = false
	}

	return (
		<div>
			{/* Put this part before </body> tag */}
			<input type='checkbox' id='my-modal-3' className='modal-toggle' />
			<div className='modal'>
				<div
					className={`modal-box max-w-[800px] max-h-[500px] relative ${
						loading && 'pointer-events-none'
					}`}
				>
					{/* modal contents  */}
					{loading && (
						<div className='absolute top-[50%] left-[45%] scale-125'>
							<div className='ml-6'>
								<Spinner />
							</div>
							<span className=' text-lg animate-pulse font-semibold pr-8'>
								Please Wait...
							</span>
						</div>
					)}
					<div className={`${loading && 'opacity-30'} relative`}>
						<label
							htmlFor='my-modal-3'
							className='btn btn-sm btn-circle absolute right-2 top-2'
						>
							✕
						</label>
						<h3 className='text-lg font-bold'>Let's create a new dataset</h3>
						<p className='py-4'>Step {step} of 3</p>
						<hr />
						{/* step 1  */}
						{step == 1 && (
							<div>
								<div className='form-control w-full max-w-xs'>
									<label className='label'>
										<span className='label-text font-semibold'>Title</span>
									</label>
									<input
										type='text'
										placeholder='Type here'
										className='input input-bordered w-full max-w-xs'
										onChange={(e) =>
											setMetadata({ ...metadata, title: e.target.value })
										}
									/>
								</div>
								<br />
								<div className='form-control w-full '>
									<label className='label'>
										<span className='label-text font-semibold'>
											Description
										</span>
									</label>
									<textarea
										type='text'
										placeholder='Type here'
										className='input input-bordered w-full h-32 p-2'
										rows={5}
										onChange={(e) =>
											setMetadata({ ...metadata, description: e.target.value })
										}
									/>
								</div>
							</div>
						)}

						{/* step2  */}

						{/* step 3   */}
						<button className='btn btn-success mt-5' onClick={handleSteps}>
							{' '}
							Next {'>'}{' '}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ModalUpload
