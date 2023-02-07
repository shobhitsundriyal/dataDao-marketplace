import { lighthouseConstants } from '@/constants'
import { useContract } from '@/contexts/ContractContext'
import { useUser } from '@/contexts/UserContext'
import { encryptionSignature } from '@/helpers'
import { getJWT } from '@lighthouse-web3/kavach'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import ImageCard from './ImageCard'
import { Chat } from '@pushprotocol/uiweb'

const DatasetPage = () => {
	const router = useRouter()
	const datasetId = router.query.id
	const [details, setDetails] = useState({}) //  title, description, coverImageHash, owner, isUserOwner
	const [indexerObject, setIndexerObject] = useState()
	const [numberAccessible, setNumberAccessible] = useState()
	const { marketplace } = useContract()
	const { userAddress, userJWT, setUser } = useUser()

	useEffect(() => {
		if (marketplace) {
			async function getDetails() {
				let metadataDetails,
					owner,
					isUserOwner = false
				const metadataHash = await marketplace.datasetMetaDateFile(
					parseInt(datasetId)
				)
				if (metadataHash) {
					const metadataResp = await axios.get(
						lighthouseConstants.lighthouseGateway + '/ipfs/' + metadataHash
					)
					// const metadata
					metadataDetails = metadataResp.data
				}
				owner = await marketplace.datasetOwner(parseInt(datasetId))
				// console.log(owner)
				if (userAddress && owner.toLowerCase() == userAddress.toLowerCase()) {
					isUserOwner = true
				}
				setDetails({ ...metadataDetails, owner, isUserOwner })
			}

			async function getIndexer() {
				const indexerHash = await marketplace.datasetIndexerFile(
					parseInt(datasetId)
				)
				const indexerResp = await axios.get(
					lighthouseConstants.lighthouseGateway + '/ipfs/' + indexerHash
				)
				const indexerData = indexerResp.data
				setIndexerObject({ ...indexerData })
			}

			async function getAccessibility() {
				const percentageAccess = await marketplace.percentageDataAccess(
					parseInt(datasetId)
				)
				const setTo = Math.floor(parseInt(percentageAccess, 16) / 10)
				setNumberAccessible(setTo)
			}

			getDetails()
			getIndexer()
			getAccessibility()
		}
	}, [marketplace])

	useEffect(() => {
		if (
			details.owner &&
			!userJWT &&
			(details.isUserOwner || numberAccessible)
		) {
			async function getSign() {
				const sig = await encryptionSignature()
				const { JWT, error: jwtError } = await getJWT(
					sig.publicKey,
					sig.signedMessage
				)
				setUser(null, JWT)
			}
			getSign()
		}
	}, [details.owner, numberAccessible])

	if (!Number(datasetId)) return <div> this data don't exist</div>

	return (
		<div>
			{/* top section  */}
			<div className='flex mt-3 max-h-[400px] min-h-[350px] pb-5'>
				<div className=' w-[30%]'>
					<div className='p-20 -mt-10 max-h-[35px]'>
						<Image
							src={`${
								details.coverImageCid
									? lighthouseConstants.lighthouseGateway +
									  '/ipfs/' +
									  details.coverImageCid
									: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/640px-Image_created_with_a_mobile_phone.png'
							}`}
							alt=''
							className=' object-fil w-full h-full rounded-2xl'
							width={15}
							height={7}
						/>
					</div>
				</div>

				<div className='flex flex-col space-y-10 w-[65%] mt-8'>
					<div className='text-6xl font-semibold font-serif'>
						{details.title}
					</div>
					<div className='text-lg font-mono'>Owner: {details.owner}</div>
					<div className='text-xl font-semibold font-mono'>
						{details.description}
					</div>
					{!details?.isUserOwner && (
						<div className='text-xl flex space-x-4 font-mono'>
							{!numberAccessible && (
								<button className='btn btn-primary btn-outline'>
									Buy Sample
								</button>
							)}
							{!(numberAccessible > 10) && (
								<button className='btn btn-accent'>Buy Full dataset</button>
							)}
						</div>
					)}
				</div>
			</div>

			<div className=' px-4'>
				<hr />
			</div>

			{/* lower section  */}
			<div className=' px-5 grid grid-cols-4 mt-5 gap-9'>
				{indexerObject &&
					(details.isUserOwner || numberAccessible > 0) &&
					Object.entries(indexerObject).map(([key, value]) => {
						return (
							<ImageCard
								idx={key}
								cid={value}
								isUserOwner={details.isUserOwner}
								key={key}
								numberAccessible={numberAccessible}
							/>
						)
					})}
				{numberAccessible === 0 && !details?.owner && (
					<span>You don't have access to this data yet</span>
				)}
			</div>
			{userAddress && details?.owner && !details.isUserOwner && (
				<Chat
					account={userAddress} //user address
					supportAddress={details.owner} //support address
					apiKey='jVPMCRom1B.iDRMswdehJG7NpHDiECIHwYMMv6k2KzkPJscFIDyW8TtSnk4blYnGa8DIkfuacU0'
					env='staging'
				/>
			)}
		</div>
	)
}

export default DatasetPage
