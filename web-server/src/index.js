const express = require('express')
const http = require('http')
const { MongoClient, ObjectId } = require('mongodb')

const app = express()

if(!process.env.PORT)
    throw new Error("Please set the environment variable PORT...")

if(!process.env.VIDEO_STORAGE_HOST)
    throw new Error("Please set the environment variable VIDEO_STORAGE_HOST...")

if(!process.env.VIDEO_STORAGE_PORT)
    throw new Error("Please set the environment variable VIDEO_STORAGE_PORT...")

if (!process.env.DBHOST)
    throw new Error("Please specify the databse host using environment variable DBHOST.")

if (!process.env.DBNAME)
    throw new Error("Please specify the name of the database using environment variable DBNAME")

const port = process.env.PORT
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT)
const DBHOST = process.env.DBHOST
const DBNAME = process.env.DBNAME

console.log('process.env.port :', process.env.PORT)
console.log('process.env.VIDEO_STORAGE_HOST', process.env.VIDEO_STORAGE_HOST)
console.log('process.env.VIDEO_STORAGE_PORT', process.env.VIDEO_STORAGE_PORT)
console.log('process.env.DBHOST : ', process.env.DBHOST)
console.log('process.env.DBNAME : ', process.env.DBNAME)

console.log(`Forwarding video requests to ${VIDEO_STORAGE_HOST}:${VIDEO_STORAGE_PORT}.`)

let dbConnection = {}

MongoClient.connect(`${DBHOST}/${DBNAME}`, (err, client) => {
    if(err){
        console.error('Error connecting to MongoDb', err)
        return
    }
    dbConnection = client.db(DBNAME)
    console.log('dbConnection : ', dbConnection)
    
})

app.get('/', (req, res) => {
    console.log('video streaming web server online...')
    res.send('Hello World!')
})

app.get('/video', (req, res) => {
    console.log('getting video with id : ', req.query.id)
    const videosCollection = dbConnection.collection('videos')
    
    const videoId = req.query.id
    console.log('videoId:  ', videoId)
    videosCollection.findOne({ _id: ObjectId(videoId)})
        .then(videoRecord => {
            if(!videoRecord){
                return res.sendStatus(404)
            }            

            console.log('videoRecord : ', videoRecord )
            const forwardRequest = http.request(
                {
                    host : VIDEO_STORAGE_HOST,
                    port : VIDEO_STORAGE_PORT,
                    path : `/video?path=${videoRecord.videoPath}`,
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
        .catch(err => {
            console.error('Database query failed')
            console.error(err && err.stack || err)
            return res.sendStatus(500)
        })
})

app.listen(port, () => {
    console.log('video streaming web server online, listening on port ', port)
})


