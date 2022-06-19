const express = require('express')
const azure = require('azure-storage')
const app = express()

const PORT = 8000;
const STORAGE_ACCOUNT_NAME = 'mmivideostreamstorage'
const STORAGE_ACCESS_KEY = 'JvAtqthYnEwE5Itog95Z2Q/h6Dv2LsS0G6HblZ9hhaDm10PzIFGmG8x+znePP5JQlvbbq86mg3HH+AStAJwNtw=='

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
    const videoPath = 'big_buck_bunny_720p_10mb.mp4'
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