const express = require('express')
const http = require('http')
const app = express()

const port = process.env.PORT
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT)


console.log('process.env.port :', process.env.PORT)
console.log('process.env.VIDEO_STORAGE_HOST', process.env.VIDEO_STORAGE_HOST)
console.log('process.env.VIDEO_STORAGE_PORT', process.env.VIDEO_STORAGE_PORT)

if(!process.env.PORT)
    throw new Error("Please set the environment variable PORT...")

if(!process.env.VIDEO_STORAGE_HOST)
    throw new Error("Please set the environment variable VIDEO_STORAGE_HOST...")

if(!process.env.VIDEO_STORAGE_PORT)
    throw new Error("Please set the environment variable VIDEO_STORAGE_PORT...")

    console.log(`Forwarding video requests to ${VIDEO_STORAGE_HOST}:${VIDEO_STORAGE_PORT}.`)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/video', (req, res) => {
    const forwardRequest = http.request(
        {
            host : VIDEO_STORAGE_HOST,
            port : VIDEO_STORAGE_PORT,
            path : '/video?path=big_buck_bunny_720p_10mb.mp4',
            method : 'GET',
            headers : req.headers
        },
        forwardResponse => {
            res.writeHeader(
                forwardResponse.statusCode,
                forwardResponse.headers)
            
                forwardResponse.pipe(res)
        }
    )

    req.pipe(forwardRequest)
})

app.listen(port, () => {
    console.log('listening on port ', port)
})