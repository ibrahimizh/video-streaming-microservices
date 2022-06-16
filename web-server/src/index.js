const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/video', (req, res) => {
    const videoPath = path.join(__dirname, "..", "videos", "big_buck_bunny_720p_10mb.mp4")

    fs.stat(videoPath, (err, stats) => {
        if(err)
        {
            console.error('An error occured', err)
            return res.sendStatus(500)
        }

        res.writeHead(200, {
            "Content-Length" : stats.size,
            "Content-Type" : "video/mp4"
        })

        fs.createReadStream(videoPath).pipe(res)
    })

})

app.listen(port, () => {
    console.log('listening on port ', port)
})