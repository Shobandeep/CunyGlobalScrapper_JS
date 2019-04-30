const puppeteer = require('puppeteer');
const fs = require('fs');

// user agent
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36';


/*
	************************
	* SELECTORS FOR PAGE 1 *
	************************
 */
const FORM_SELECTOR = '#wrapper > form:nth-child(19)';
const QUEENS_COLLEGE_SELECTOR = '#QNS01';
const TERM_SELECTOR = '#t_pd';
	/*
		values for TERM_SELECTOR:
			1192 - Spring 2019
			1196 - Summer 2019
			1199 - Fall 2019
	*/
const NEXT_BUTTON_SELECTOR = 'input.SSSBUTTON_CONFIRMLINK';

/*
	************************
	* SELECTORS FOR PAGE 2 *
	************************
 */
const SUBJECT_SELECTOR = '#subject_ld';
/*
	values for SUBJECT_SELECTOR:
	CMSC - computer science
*/
const CAREER_SELECTOR = '#courseCareerId';
/*
	values for CAREER_SELECTOR:
	GRAD - Graduate
	UGRD - Undergraduate
*/
const SUBMIT_BUTTON_SELECTOR = '#btnGetAjax';

/*
	************************
	* SELECTORS FOR PAGE 3 *
	************************
 */
const COURSE_SELECTOR = '#contentDivImg_inst0 > [id^=contentDivImg]';

async function getData() {

	// open a new window and page
	const broswer = await puppeteer.launch({headless: true, defaultViewPort: {width: 800, height: 1200}});
	const page = await broswer.newPage();
	await page.setUserAgent(USER_AGENT);


	/*
		PAGE 1
	*/
  // wait for entire page to load
	await page.goto('https://globalsearch.cuny.edu/CFGlobalSearchTool/search.jsp', {waituntil: 'load'});

	// select college(s)
	await page.click(QUEENS_COLLEGE_SELECTOR);

	// select term
	await page.$eval(TERM_SELECTOR, (termSelect) => {
		termSelect.value = '1199';
	});

	// submit form
  await page.click(NEXT_BUTTON_SELECTOR);


	/*
		PAGE 2
	*/
	// make sure the element is loaded before editing
	await page.waitForSelector(SUBJECT_SELECTOR);
	// select subject
	await page.$eval(SUBJECT_SELECTOR, (subjectSelect) => {
		subjectSelect.value = 'CMSC';
	});

	// select career
	await page.$eval(CAREER_SELECTOR, (careerSelect) => {
		careerSelect.value = 'UGRD';
	});

	// submit form (again)
  await page.click(SUBMIT_BUTTON_SELECTOR);

	// insurance
	await page.waitFor(3000);




	const result = await page.$$eval(COURSE_SELECTOR, (courseArray) => {
		let classes = new Array();

		for(let k = 0; k < courseArray.length; k++) {
			let sections = courseArray[k].querySelectorAll('tr td.cunylite_LEVEL3GRIDROW');
			let tempSection = new Array();
			let j = 0;
			for(let i = 0; i < sections.length; i+=10,j++) {
				tempSection[j] = new Object();
				// slice off &nbsp 
				tempSection[j].sectionNumber = sections[i+1].firstElementChild.innerHTML;
				tempSection[j].section = sections[i+2].firstElementChild.innerHTML;
				tempSection[j].time = sections[i+3].innerHTML.slice(0,sections[i+3].innerHTML.length-6);
				tempSection[j].room = sections[i+4].innerHTML.slice(0,sections[i+4].innerHTML.length-6);
				tempSection[j].instructor = sections[i+5].innerHTML.slice(0,sections[i+5].innerHTML.length-6);
				tempSection[j].classType = sections[i+6].innerHTML.slice(0,sections[i+6].innerHTML.length-6);
				tempSection[j].classDescription = sections[i+9].innerHTML.slice(0,sections[i+9].innerHTML.length-6);
			}
			classes.push(tempSection);
		}
		return classes;
	});


	console.log('end of program ');
	// write results to a file
	fs.writeFile('classes.json', JSON.stringify(result,null, 3), (err) => {
		if(err) throw err;
		console.log('file write: okay');
	});

	await broswer.close();
}


getData();
