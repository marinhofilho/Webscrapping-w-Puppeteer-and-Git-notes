const express = require('express');
const puppeteer = require('puppeteer');

const server = express();

server.get('/', async (request, response) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // go to page - can be done with variables
  await page.goto('https://pt.wikipedia.org/wiki/Lista_dos_melhores_filmes_de_todos_os_tempos_segundo_a_Bravo');

  
  // extract data from page
  const pageContent = await page.evaluate(() => {

    // create movie list
    const list = [];
    
    // extract movies names
    const movies = document.querySelectorAll('tbody tr td a i:first-child, tbody tr td i a:first-child') ;
        
    // insert movies into list
    movies.forEach(function (el, index){
      list.push(`${index + 1} lugar: ${el.innerHTML}`); 
    })

    // get movie links from page - uses arrow function without braces in a single line
    const movieRowLink = Array.from(document.querySelectorAll('table tr td:nth-child(2) a'), a => a.getAttribute('href'));

     // get director links from page - cannot get with only 'a' tags because there are also 'i' tags
    const directorLink = Array.from(
      document.querySelectorAll('table tr td:nth-child(4)')
    );

    // insert movie and director links into list creating an object
    const result = Object.assign(...list
        .map((el, i) => ({
          [el]: 
          ( 
            'Link para o filme: https://pt.wikipedia.org' + 
            movieRowLink[i] + 
            ' - ' + 
            'Diretor: https://pt.wikipedia.org/wiki/' + 
            directorLink[i].textContent
            //select all whitespaces 's' but excludes the ones at the ending of the string = "negative lookahead"
              .replace(
                /\s(?!$)/g, '_'
              )
              // there were still white spaces to be excluded in the end of the string
              .trim()
              // select all '_e_', case insensitive, and replaces them in order not to break the link
              .replace(
                /(_e_)(.*)/gi, '_'
              )
              // check: https://regex101.com/
          )
        }))
      );

    // get random number for movie
    function getRandomInt(min, max) {
      // ceil returns the smallest interger
      min = Math.ceil(min);
      // floor returns the greastest interger
      max = Math.floor(max);
      // random provides a number between 0 and 1
      return Math.floor(Math.random() * (max - min)) + min;
    }
    // probably need to do list.lenght + 1 - to be checked
    const selectedMovieNumber = getRandomInt(0, list.length);

    // get random movie from list
    const selectedMovieResult = list[selectedMovieNumber];

    // get selected movie info - destructuring assignment
    // entries returns an array, and we are getting the array with the key, value we want
    const selectMovieInfo = Object.entries(result)
    .find(([key, value]) => key === selectedMovieResult)


     /* excludes selected movie from the resultList
      currently not being used
     const { [selectedMovieResult]: _, ...newData } = result; */

    return {
      selectedMovieResult: selectedMovieResult,
      selectMovieInfo: selectMovieInfo,
      selectedMovieNumber: selectedMovieNumber,
      result: result,
    };
  });

  /* const formattedMovieName = pageContent.selectedMovie
    .replace(/(\w+)\s(\w+)(\W)\s/, '')
    .toLowerCase()
    .replace(/ /g, '_');

  // get select movie data
  await page.goto('https://pt.wikipedia.org/wiki/' + formattedMovieName);
  console.log(formattedMovieName)
  */
  await browser.close(); 

    response.send({
      pageContent,
  });
});


const port = 4443;
server.listen(port, () => {
  console.log(`
    Servidor subiu
    Acesse em http://localhost:${port}
  `)
});

/*(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.alura.com.br/cursos-online-front-end');
  // await page.screenshot({ path: 'example.png' });

  await browser.close(); 
})(); */