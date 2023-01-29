import Head from 'next/head'
import Image from 'next/image'
import lodash from 'lodash'
import { Inter } from '@next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
	console.log(lodash.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
	return (
		<h1>
			<input
				type='file'
				multiple
				onChange={(e) => {
					const fileList = e.target.files
					const shuffledList = lodash.shuffle(fileList)
					console.log({ shuffledList, fileList })
				}}
			/>
			<button className=' bg-black text-white'>upload</button>
		</h1>
	)
}
