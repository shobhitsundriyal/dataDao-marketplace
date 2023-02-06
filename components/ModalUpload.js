import React, { useEffect, useState } from 'react'
import Spinner from './Spinner'
import lgh, { uploadText, upload } from '@lighthouse-web3/sdk'
import { useContract } from '@/contexts/ContractContext'
import { uploadEncryptedFiles } from '@/helpers'
import { tokenAddress } from '@/contracts/contractDetails'
import { ethers } from 'ethers'

const ModalUpload = () => {
	const [step, setStep] = useState()
	const [metadata, setMetadata] = useState()
	const [metadataCid, setMetadataCid] = useState()
	const [indexerCid, setIndexerCid] = useState()
	const [loading, setLoading] = useState(false)
	const [price, setPrice] = useState()

	// let loading = false
	const { marketplace } = useContract()
	// console.log({ marketplace })
	// debugger

	useEffect(() => {
		setStep(1)
		setMetadata({
			title: '',
			description: '',
			coverImageCid: '',
		})
	}, [])

	const handleSteps = async (e = null) => {
		setLoading(true)

		if (step === 1) {
			//get cid for metadata
			const metadataHash = await uploadText(
				JSON.stringify(metadata),
				process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY
			)
			// console.log(metadataHash)
			setMetadataCid(metadataHash.data.Hash)

			// setDatasetId(dataId)
		} else if (step === 2) {
			// not correct flow but what can we do now :?
			const latestId = await marketplace.latestDataId()
			const newDataId = parseInt(latestId._hex, 16) + 1
			// console.log(newDataId)
			const indexerObject = await uploadEncryptedFiles(
				e,
				tokenAddress,
				newDataId
			)
			console.log({ indexerObject })
			const indexerHash = await uploadText(
				JSON.stringify(indexerObject),
				process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY
			)
			setIndexerCid(indexerHash.data.Hash)
		} else {
			//step 3
			// console.log({ indexerCid, metadataCid })
			const resp = await marketplace.createdDataset(
				ethers.utils.parseEther(price),
				indexerCid,
				metadataCid
			)
			await resp.wait()
			if (resp) console.log(' dataset registers on contract :-)')
		}

		setStep((prev) => (prev < 4 ? prev + 1 : prev))
		setLoading(false)
	}

	return (
		<div>
			{/* Put this part before </body> tag */}
			<input type='checkbox' id='my-modal-3' className='modal-toggle' />
			<div className='modal'>
				<div
					className={`modal-box max-w-[800px] relative ${
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
						<p className='py-4'>Step {step} of 4</p>
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

								<div className='form-control w-full max-w-xs'>
									<label className='label'>
										<span className='label-text font-semibold'>
											Choose cover Image
										</span>
									</label>
									<input
										type='file'
										className='file-input w-full max-w-xs'
										accept='image/jpeg, image/png'
										onChange={async (e) => {
											upload(
												e,
												process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY
												// progressCallback
											).then((resp) => {
												console.log('File Status:', resp)
												setMetadata({
													...metadata,
													coverImageCid: resp.data.Hash,
												})
											})
										}}
									/>
								</div>

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
						{step === 2 && (
							<div className='mt-8'>
								<div className='flex items-center justify-center w-full'>
									<label
										htmlFor='dropzone-file'
										className='flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'
									>
										<div className='flex flex-col items-center justify-center pt-5 pb-6'>
											<svg
												aria-hidden='true'
												className='w-10 h-10 mb-3 text-gray-400'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth='2'
													d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
												></path>
											</svg>
											<p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
												<span className='font-semibold'>Click to upload</span>{' '}
												or drag and drop
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400'>
												SVG, PNG, JPG or GIF
											</p>
										</div>
										<input
											id='dropzone-file'
											type='file'
											className='hidden'
											multiple
											onChange={(e) => handleSteps(e)}
										/>
									</label>
								</div>
							</div>
						)}

						{/* step 3   */}
						{step === 3 && (
							<div className='mt-8 text-lg font-semibold'>
								Let's finalize the transaction to create your dataset and set
								price
								<input
									type='text'
									placeholder='Type here'
									className='input input-bordered w-full max-w-xs mt-4'
									onChange={(e) => setPrice(e.target.value)}
								/>{' '}
								&nbsp;FIL
							</div>
						)}

						{/* step 4   */}
						{step === 4 && (
							<div className='mt-8 text-lg font-semibold'>
								Your Dataset was successfully created
							</div>
						)}

						{step < 4 && (
							<button className='btn btn-success mt-5' onClick={handleSteps}>
								{' '}
								Next {'>'}{' '}
							</button>
						)}
						{step === 4 && (
							<label className='btn btn-error mt-5' htmlFor='my-modal-3'>
								Close
							</label>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default ModalUpload
