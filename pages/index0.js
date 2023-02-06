import Head from 'next/head'
import Image from 'next/image'
import lodash from 'lodash'
import lighthouse from '@lighthouse-web3/sdk'
import { getAuthMessage, AuthMessage, getJWT } from '@lighthouse-web3/kavach'
import { ethers } from 'ethers'
import { Inter } from '@next/font/google'
import { useEffect, useRef, useState } from 'react'

import { generate, saveShards } from '@lighthouse-web3/kavach'
import axios from 'axios'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
	const [files, setFiles] = useState()
	const [singleEvent, setSingleEvent] = useState()
	const [counter, setCounter] = useState(0)
	const theRef = useRef()
	let theEvent = null

	useEffect(() => {
		if (files) {
			setSingleEvent(() => {
				return {
					...files,
					target: { ...files.target, files: [{ ...files.target.files[0] }] },
				}
			})
		}
		console.log(files?.target?.files[0])
	}, [files])

	const encryptionSignature = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const address = await signer.getAddress()
		const messageRequested = (await lighthouse.getAuthMessage(address)).data
			.message
		const signedMessage = await signer.signMessage(messageRequested)
		return {
			signedMessage: signedMessage,
			publicKey: address,
		}
	}

	const encryptionSignature2 = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const address = await signer.getAddress()
		const authMessage = await getAuthMessage(address)
		// debugger
		const messageRequested = authMessage.message
		const signedMessage = await signer.signMessage(messageRequested)
		return {
			signedMessage: signedMessage,
			publicKey: address,
			authMessage,
		}
	}

	const readFileAsync = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()

			reader.onload = () => {
				reader.result && resolve(reader.result)
			}

			reader.onerror = reject

			reader.readAsArrayBuffer(file)
		})
	}

	const encryptFile = async (fileArrayBuffer, password) => {
		try {
			const plainTextBytes = new Uint8Array(fileArrayBuffer)
			const passwordBytes = new TextEncoder().encode(password)

			const salt = window.crypto.getRandomValues(new Uint8Array(16))
			const iv = window.crypto.getRandomValues(new Uint8Array(12))

			const passwordKey = await importKeyFromBytes(passwordBytes)

			const aesKey = await deriveKey(passwordKey, ['encrypt'], {
				name: 'PBKDF2',
				salt: salt,
				iterations: 250000,
				hash: 'SHA-256',
			})
			const cipherBytes = await window.crypto.subtle.encrypt(
				{ name: 'AES-GCM', iv: iv },
				aesKey,
				plainTextBytes
			)

			const cipherBytesArray = new Uint8Array(cipherBytes)
			const resultBytes = new Uint8Array(
				cipherBytesArray.byteLength + salt.byteLength + iv.byteLength
			)
			resultBytes.set(salt, 0)
			resultBytes.set(iv, salt.byteLength)
			resultBytes.set(cipherBytesArray, salt.byteLength + iv.byteLength)

			return resultBytes
		} catch (error) {
			console.error('Error encrypting file')
			console.error(error)
			throw error
		}
	}
	const importKeyFromBytes = async (keyBytes) =>
		window.crypto.subtle.importKey('raw', keyBytes, 'PBKDF2', false, [
			'deriveKey',
		])
	const deriveKey = async (sourceKey, keyUsage, keyDerivationParams) =>
		window.crypto.subtle.deriveKey(
			keyDerivationParams,
			sourceKey,
			{ name: 'AES-GCM', length: 256 },
			false,
			keyUsage
		)

	const progressCallback = (progressData) => {
		let percentageDone =
			100 - (progressData?.total / progressData?.uploaded)?.toFixed(2)
		console.log(percentageDone)
	}

	/* Deploy file along with encryption */
	const deployEncrypted = async () => {
		/*
       uploadEncrypted(e, publicKey, accessToken, uploadProgressCallback)
       - e: js event
       - publicKey: wallets public key
       - accessToken: your api key
       - signedMessage: message signed by the owner of publicKey
       - uploadProgressCallback: function to get progress (optional)
    */
		// theEvent.dispatchEvent(new Event('change', { bubbles: true }))
		// console.log(theEvent)
		// console.log(files)
		// return
		const sig = await encryptionSignature2()
		console.log({ sig })
		// const pubKey = '0x6BeF65D67c45505bA9BD5A747bA18Bb078E63549'
		// let signer = new ethers.Wallet(pubKey)

		// get consensus message
		// const authMessage = await getAuthMessage(sig.publicKey)
		// const signedMessage = await signer.signMessage(authMessage.message)

		const { JWT, error } = await getJWT(sig.publicKey, sig.signedMessage)
		console.log({ JWT })

		const response = await lighthouse.uploadEncrypted(
			files,
			sig.publicKey,
			process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY,
			JWT,
			progressCallback
		)
		console.log(response)
		/*
      output:
        {
          Name: "c04b017b6b9d1c189e15e6559aeb3ca8.png",
          Size: "318557",
          Hash: "QmcuuAtmYqbPYmPx3vhJvPDi61zMxYvJbfENMjBQjq7aM3"
        }
      Note: Hash in response is CID.
    */
	}

	const uploadMultiple = async () => {
		// const shuffledArr = lodash.shuffle(files.target.files)
		await setSingleEvent(() => {
			return {
				...files,
				target: { ...theRef.current, files: { ...theRef.current.files[0] } },
			}
		})
		const sig = await encryptionSignature()
		console.log(sig)
		return
		console.log(singleEvent)
		// console.log({
		// 	...files,
		// 	target: { ...files.target, files: { ...shuffledArr[0] } },
		// })
		console.log(files)
		console.log({ theRef })
		// debugger
		// for (let i = 0; i < shuffledArr.length; i++) {
		const response = await lighthouse.uploadEncrypted(
			files,
			sig.publicKey,
			process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY,
			sig.signedMessage,
			progressCallback
		)
		console.log(response)
		// }
	}

	const newDeployEncrypted = async (e) => {
		const sig = await encryptionSignature2()
		console.log({ sig })
		const { JWT, error: jwtError } = await getJWT(
			sig.publicKey,
			sig.signedMessage
		)
		console.log({ JWT })

		const { masterKey: fileEncryptionKey, keyShards } = await generate()

		const endpoint = 'https://node.lighthouse.storage' + '/api/v0/add'
		const token = 'Bearer ' + process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY

		const shuffledArr = lodash.shuffle(e.target.files)

		for (let i = 0; i < shuffledArr.length; i++) {
			let fileToUpload = shuffledArr[i]

			const formData = new FormData()
			const filesParam = await Promise.all(
				[fileToUpload].map(async (f) => {
					const fileData = await readFileAsync(f)
					const encryptedData = await encryptFile(fileData, fileEncryptionKey)
					return {
						data: new Blob([encryptedData], { type: f.type }),
						fileName: f.name,
					}
				})
			)
			filesParam.forEach(function (item_) {
				return formData.append(
					'file',
					item_.data,
					item_.fileName ? item_.fileName : 'file'
				)
			})

			const response = await axios.post(endpoint, formData, {
				maxContentLength: 'Infinity',
				maxBodyLength: 'Infinity',
				headers: {
					'Content-type': `multipart/form-data; boundary= ${formData._boundary}`,
					Encryption: true,
					'Mime-Type': fileToUpload.type, /// make this dynamic
					Authorization: token,
				},
			})

			const { isSuccess, error } = await saveShards(
				sig.publicKey,
				response.data.Hash,
				JWT,
				keyShards
			)
			if (error) {
				throw new Error('Error encrypting file')
			}
			console.log({ response }, 'file uploaded')

			//apply access control
			const cid = response.data.Hash
			if (cid) {
				const conditions = [
					{
						id: 1,
						chain: 'Polygon',
						method: 'balanceOf',
						standardContractType: 'ERC20',
						contractAddress: '0x7E4c577ca35913af564ee2a24d882a4946Ec492B',
						returnValueTest: {
							comparator: '>=',
							value: '1',
						},
						parameters: [':userAddress'],
					},
				]
				const aggregator = '([1])'

				const responseAC = await lighthouse.accessCondition(
					sig.publicKey,
					cid,
					JWT,
					conditions,
					aggregator
				)

				console.log(responseAC, ' access control added')
			}
		}
	}
	return (
		<h1>
			<input
				type='file'
				multiple
				onChange={(e) => {
					setFiles(e)
					theEvent = e
				}}
				// ref={theRef}
				ref={(ref) => (theEvent = ref)}
			/>
			<button className=' bg-black text-white' onClick={newDeployEncrypted}>
				upload
			</button>
		</h1>
	)
}
