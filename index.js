const http = require('http')
const fs = require('fs')
const requests = require('requests')

const htmlFile = fs.readFileSync('index.html', 'utf-8', (err) => {
    console.log('done')
})

const replaceVal = (tempval, orgval) => {
    let temperature = tempval.replace('{%tempval%}', Math.round((orgval.main.temp-273)*100)/100)
    temperature = temperature.replace('{%tempmin%}', Math.round((orgval.main.temp_min-273)*100)/100)
    temperature = temperature.replace('{%tempmax%}', Math.round((orgval.main.temp_max-273)*100)/100)
    temperature = temperature.replace('{%city%}', orgval.name)
    temperature = temperature.replace('{%country%}', orgval.sys.country)
    let l = Math.floor(Math.random()*orgval.weather.length)
    temperature = temperature.replace('{%weatherurl%}', orgval.weather[l].description)
    temperature = temperature.replace('{%weather%}', orgval.weather[l].main)
    return temperature
}

const server = http.createServer((req, res) => {
    let cityname = ''
    if (req.url !== '/favicon.ico') {
        req.url.slice(1) ? cityname = req.url.slice(1) : cityname = 'hyderabad'
        let api = `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=e56df4762281a3442e899211379f93e3`
        requests(api)
        
        .on('data', (chunk) => {
            const objData = JSON.parse(chunk)
            const arrData = [objData]
            if(objData.cod === 200){
                const realTimeData = arrData.map((val) => replaceVal(htmlFile, val))
                res.write(realTimeData.join(""))
            }
            else {
                res.write('404:No Such City Found')
            }
        })
        
        .on('end', (err) => {
        if (err) return console.log('connection closed due to errors', err);
        res.end()
        });
    }
})

server.listen(8080, '127.0.0.1')