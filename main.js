import fs from 'fs'
import https from 'https'
import moment from 'moment'


function convertDatasource1ToMyData(lines){
  const head = lines[0].split(',')
  console.log('head', head)
  const linesReal = lines.slice(1, lines.length - 1)
  console.log('has real line:', linesReal.length)
  console.log('line 0:', linesReal[0])
  console.log('line last:', linesReal[linesReal.length -1])

  const places = {}
  linesReal.forEach(line => {
    if(line.trim() === ''){
      console.log('cancel empty line')
    }
    const elements = line.split(',')
    if(elements.length !== head.length){
      //throw Error( `bad line:'${line}'`)
      console.error('bad line:', line)
      return
    }
    const place = elements[1] + (elements[0]? ('|' + elements[0]) : '')
    if(places[place]){
      //
    }else{
      const a = {
        confirmedCount : {
        },
        Lat: elements[2],
        Long: elements[3],
        source: 1,
      }
      for(let i = 4; i < head.length; i++ ){
        //a date
        const date = head[i]
        if(!/\d+\/\d+\//.test(date)){
          throw Error('the head is not a date:', date)
        }
        const dateFormated = moment(date, 'M/D/YY').format('YYYYMMDD')
        const cases = elements[i]
        if(!/\d+/.test(cases)){
          throw Error('the cases is not a number:', cases)
        }
        const casesNumbered = parseInt(cases)
        if(casesNumbered > 0){
          a.confirmedCount[dateFormated] = casesNumbered
        }
      }
      places[place] = a
    }
  })
  console.log('country sample:', Object.keys(places).slice(0, 5))
  console.log('country count:', Object.keys(places).length)
  console.log('Afghanistan:', places['Afghanistan'])
  return places

}

function convertDatasource2ToMyData(json){
  console.log('countries count:', Object.keys(json).length)
  //{
  //  China|Beijing : {
  //    confirmedCount : {
  //      20200101: 1,
  //      20200102: 2,
  //      ...
  //    }
  //  }
  //  ...
  //}
  const places = {}
  //ignore Global
  delete json['全球']
  Object.values(json).forEach(country => {
    const countryName = country.ENGLISH
    if(!countryName){
      console.warn('haven\'t english name:', country)
      return
    }
    const confirmedCount = country.confirmedCount
    if(!confirmedCount){
      console.warn('haven\'t confirmedCount:', country)
      return
    }
    places[countryName] = {
      confirmedCount,
      source: 2,
    }

    //adm 1
    Object.keys(country).filter(e => e !== 'ENGLISH' &&
      e !== 'confirmedCount' &&
      e !== 'curedCount' &&
      e !== 'deadCount'
    ).forEach(key => {
      const adm1Place = country[key]
      const adm1Name = adm1Place.ENGLISH
      if(!adm1Name){
        console.warn('haven\'t english name:', adm1Place)
        return
      }
      const confirmedCount = adm1Place.confirmedCount
      if(!confirmedCount){
        console.warn('haven\'t confirmedCount:', adm1Place)
        return
      }
      places[countryName + "|" + adm1Name] = {
        confirmedCount,
        source: 2,
      }

      //adm 2
      Object.keys(adm1Place).filter(e => e !== 'ENGLISH' &&
        e !== 'confirmedCount' &&
        e !== 'curedCount' &&
        e !== 'deadCount'
      ).forEach(key => {
        const adm2Place = adm1Place[key]
        const adm2Name = adm2Place.ENGLISH
        if(!adm2Name){
          console.warn('haven\'t english name:', adm2Name)
          return
        }
        const confirmedCount = adm2Place.confirmedCount
        if(!confirmedCount){
          console.warn('haven\'t confirmedCount:', adm2Place)
          return
        }
        places[countryName + "|" + adm1Name + "|" + adm2Name] = {
          confirmedCount,
          source: 2,
        }

        //adm 3
        Object.keys(adm2Place).filter(e => e !== 'ENGLISH' &&
          e !== 'confirmedCount' &&
          e !== 'curedCount' &&
          e !== 'deadCount'
        ).forEach(key => {
          const adm3Place = adm2Place[key]
          const adm3Name = adm3Place.ENGLISH
          if(!adm3Name){
            console.warn('haven\'t english name:', adm3Name)
            return
          }
          const confirmedCount = adm3Place.confirmedCount
          if(!confirmedCount){
            console.warn('haven\'t confirmedCount:', adm3Place)
            return
          }
          places[countryName + "|" + adm1Name + "|" + adm2Name + "|" + adm3Name] = {
            confirmedCount,
            source: 2,
          }

          //adm 4
          Object.keys(adm3Place).filter(e => e !== 'ENGLISH' &&
            e !== 'confirmedCount' &&
            e !== 'curedCount' &&
            e !== 'deadCount'
          ).forEach(key => {
            const adm4Place = adm3Place[key]
            const adm4Name = adm4Place.ENGLISH
            if(!adm4Name){
              console.warn('haven\'t english name:', adm4Name)
              return
            }
            const confirmedCount = adm4Place.confirmedCount
            if(!confirmedCount){
              console.warn('haven\'t confirmedCount:', adm4Place)
              return
            }
            places[countryName + "|" + adm1Name + "|" + adm2Name + "|" + adm3Name + "|" + adm4Name] = {
              confirmedCount,
              source: 2,
            }
          })
        })
      })

    })
  })
  console.log('plases sample:', Object.keys(places).slice(0, 2))
  console.log('plases count:', Object.keys(places).length)

  return places

}

function outputTable(places){
  //generate the output table
  const outputHead = [
    'num',
    'lat',
    'lon',
    'cases',
    'deaths',
    'recovered',
    'DayStart',
    'DayEnd',
    'placetype',
    'adm0',
    'adm1',
    'adm3',
    'adm4',
    'indiv',
    'source',
  ]
  let num = 1
  const outputLines = []
  Object.keys(places).sort((a,b) => a >= b? 1: -1).forEach(place => {
    const placeValue = places[place]
    let casesAccumulated = 0
    Object.keys(placeValue.confirmedCount).forEach(dateString => {
      const adms = place.split('|')
      let line = ''
      const cases = parseInt(placeValue.confirmedCount[dateString])
      if(casesAccumulated === cases){
        //equal cases, combine
        outputLines[outputLines.length - 1 ] = [...outputLines[outputLines.length - 1]]
        outputLines[outputLines.length - 1][7] = dateString
      }else{
        const line = [
          num++,
          placeValue.Lat? placeValue.Lat:'',
          placeValue.Long? placeValue.Long:'',
          cases,
          '',
          '',
          dateString,
          dateString,
          `adm${adms.length - 1}`,
          adms[0],
          adms[1]?adms[1]:'',
          adms[2]?adms[2]:'',
          adms[3]?adms[3]:'',
          '',
          placeValue.source? ['CSSEGISandData', 'stevenliuyi', 'beoutbreakprepared'][placeValue.source -1]:'',
        ]
        outputLines.push(line)
        casesAccumulated = cases
      }
    })
  })
  console.log('output lines sample:', outputLines.slice(0, 2))
  console.log('output lines num:', outputLines.length)
  const countries = {
  }
  Object.keys(places).forEach(place => {
    const placeValue = places[place]
    const name = place.split('|')[0]
    const dates = Object.values(placeValue.confirmedCount)
    if(countries[name]){
      countries[name] = countries[name] + dates[dates.length - 1]
    }else{
      countries[name] = dates[dates.length - 1]
    }
  })
  console.log('countries count:', Object.keys(countries).length)
  console.log('countries sample:', Object.keys(countries).slice(0, 5))
  console.log('countries cases sample:', Object.values(countries).slice(0, 5))
  return {
    outputLines: [outputHead, ...outputLines],
    places,
    countries
  }
}

function run(){
  //data source 1
  let places1
  let places2
  fetch('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv').then(data => {
    const dataString = data.toString()
    console.log('sample data:', dataString.slice(0, 200))
    const lines = dataString.split(/\n/)
    console.log('has line:', lines.length)
    console.log('line 0:', lines[0])
    console.log('line last:', lines[lines.length -1])
    places1 = convertDatasource1ToMyData(lines)
  }).then(() => {
    return fetch('https://raw.githubusercontent.com/stevenliuyi/covid19/master/public/data/all.json')
  }).then(data => {
    const json = JSON.parse(data.toString())
    places2 = convertDatasource2ToMyData(json)
    //merge
    const places = Object.assign(places2, places1)

    //const places = {}
    const result = outputTable(places)
    //output
    fs.writeFileSync(
      '../coronavirus_map_data/data.csv',
      result.outputLines.reduce((a,c) => {
        return a + '\n' + c.join(',') 
      },'')
    )
    fs.writeFileSync(
      '../coronavirus_map_data/report.csv',
      'total area, total countries,last update' + '\n' + 
      Object.keys(result.places).length + ',' + 
      Object.keys(result.countries).length + ',' + 
      moment(new Date()).format('YYYYMMDD HH:mm') + 
      '\n'
    )
  })
}

function fetch(url){
  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {
      let data = '';
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        console.log('fetch data sameple:', data.slice(0,100));
        resolve(data)
      });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  })
}

export {fetch, run, convertDatasource1ToMyData, convertDatasource2ToMyData, outputTable}

