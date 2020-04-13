import fs from 'fs'

describe('test', () => {

  it('init', () => {
    fs.readFileSync('./sample/data.cvs') 
  })
})
