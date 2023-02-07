import { useUser } from '@/contexts/UserContext'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import lighthouse from '@lighthouse-web3/sdk'

const ImageCard = ({ idx, cid, isUserOwner, numberAccessible }) => {
	const { userJWT, userAddress } = useUser()
	const [src, setSrc] = useState()

	useEffect(() => {
		if (userJWT && userAddress && (isUserOwner || numberAccessible > idx)) {
			async function getImage() {
				const keyObject = await lighthouse.fetchEncryptionKey(
					cid,
					userAddress,
					userJWT
				)
				const fileType = 'image/jpeg'
				const decrypted = await lighthouse.decryptFile(
					cid,
					keyObject.data.key,
					fileType
				)
				const source = URL.createObjectURL(decrypted)
				setSrc(source)
			}

			getImage()
		}
	}, [userJWT])

	if (!isUserOwner && numberAccessible <= idx) return

	return (
		<div className=' w-full h-60'>
			<Image
				src={`${
					src ??
					'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/640px-Image_created_with_a_mobile_phone.png'
				}`}
				alt=''
				className=' object-fil w-full h-full rounded-2xl'
				width={15}
				height={7}
			/>
		</div>
	)
}

export default ImageCard
