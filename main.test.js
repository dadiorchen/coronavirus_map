import fs from 'fs'
import https from 'https'
import moment from 'moment'
import {fetch, convertDatasource1ToMyData, convertDatasource2ToMyData, outputTable} from './main.js'

describe('moment', () => {
  it('2/24/20 -> 20200122', () => {
    console.log(moment('2/24/20','M/D/YY').format('YYYYMMDD'))
  })

})

describe('test', () => {

  it('datasource1', () => {
    const data = fs.readFileSync('./samples/source1.csv') 
    const dataString = data.toString()
    console.log('sample data:', dataString.slice(0, 200))
    const lines = dataString.split(/\n/)
    console.log('has line:', lines.length)
    console.log('line 0:', lines[0])
    console.log('line last:', lines[lines.length -1])
    const places = convertDatasource1ToMyData(lines)
    outputTable(places)
  })

  it('datasource2', () => {
    const data = fs.readFileSync('./samples/source2.json')
    const json = JSON.parse(data.toString())
    const places = convertDatasource2ToMyData(json)
    const result = outputTable(places)
    console.log('output table sample:', result.outputLines.slice(0, 5))
  })


  it.skip('fetch data from url datasource 1 global ', () => {
    return fetch('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
  })

  it.skip('fetch data from url datasource 1 us ', () => {
    return fetch('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv')
  })

  it.skip('fetch data from url datasource 2', () => {
    return fetch('https://raw.githubusercontent.com/stevenliuyi/covid19/master/public/data/all.json')
  }, 100000)
})
