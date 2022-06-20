const express = require('express')
const azure = require('azure-storage')
const app = express()

const PORT = parseInt(process.env.PORT);
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY

console.log('process.env.port :', process.env.PORT)
console.log('process.env.STORAGE_ACCOUNT_NAME', process.env.STORAGE_ACCOUNT_NAME)
console.log('process.env.STORAGE_ACCESS_KEY', process.env.STORAGE_ACCESS_KEY)

if(!process.env.PORT)
    throw new Error("Please set the environment variable PORT...")

if(!process.env.STORAGE_ACCOUNT_NAME)
    throw new Error("Please set the environment variable STORAGE_ACCOUNT_NAME...")

if(!process.env.STORAGE_ACCESS_KEY)
    throw new Error("Please set the environment variable STORAGE_ACCESS_KEY...")

function createBlobService() {
    const blobService = azure.createBlobService(
        STORAGE_ACCOUNT_NAME,
        STORAGE_ACCESS_KEY)
    console.log('create blob service successful...', blobService)
    return blobService
}

app.get('/', (req, res) => {
    console.log('GET...')
    res.send('Azure Storage Microservice online ....')
})

app.get('/video', (req, res) => {
    console.log('getting video...')
    const videoPath = req.query.path
    const blobService = createBlobService()
    const containerName = 'videos'

    blobService.getBlobProperties(
        containerName, 
        videoPath, 
        (err, properties) => {
            
            if(err){
                console.error('Error getting Blob properties', err)
                return res.sendStatus(500)
            }

            res.writeHead(
                200,
                {
                    'Content-Length' : properties.contentLength,
                    'Content-Type' : 'video/mp4'
                }
            )

            blobService.getBlobToStream(
                containerName,
                videoPath,
                res,
                err => {
                    if(err){
                        console.error('Error streaming...', err)
                        return res.sendStatus(500)
                    }
                }
            )

    })
})

app.listen(PORT, () => {
    console.log('Azure Storage Microservice online ....', PORT)
})