import lodash from 'lodash'
import lighthouse from '@lighthouse-web3/sdk'
import { getAuthMessage, AuthMessage, getJWT } from '@lighthouse-web3/kavach'
import { ethers } from 'ethers'

import { generate, saveShards } from '@lighthouse-web3/kavach'
import axios from 'axios'

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

const encryptionSignature = async () => {
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

const uploadEncryptedFiles = async (e, tokenAddress, datasetId) => {
	let indexer = {}
	const sig = await encryptionSignature()
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

		indexer[String(i + 1)] = response.data.Hash //for now take from the loop (all are jpegs)

		//apply access control
		const cid = response.data.Hash
		if (cid) {
			const conditions = [
				{
					id: 1,
					chain: 'BSCTest',
					method: 'balanceOf',
					standardContractType: 'ERC1155',
					contractAddress: tokenAddress,
					returnValueTest: {
						comparator: '>=',
						value: String(i + 1),
					},
					parameters: [':userAddress', String(datasetId)],
					// tokenId: datasetId,
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
	return indexer
}

export { uploadEncryptedFiles, encryptionSignature }
