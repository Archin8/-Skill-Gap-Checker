import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export const scrapeJobVacancies = async (domain) => {
  console.log(`Starting scraper for domain: ${domain}`);
  const jobs = [];
  let browser;

  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true, // Run in the background without a visible browser window
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessary for some environments
    });
    const page = await browser.newPage();

    // Construct the URL for Indeed search
    const searchTerm = encodeURIComponent(domain);
    const url = `https://www.indeed.com/jobs?q=${searchTerm}&l=United+States`;
    
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Get the HTML content of the page
    const content = await page.content();
    const $ = cheerio.load(content);

    console.log('Page loaded, extracting job cards...');

    // FIX: Updated selectors for Indeed's current layout. This is the most common point of failure.
    const jobCards = $('#jobsearch-ResultsList > li');
    console.log(`Found ${jobCards.length} potential job cards.`);

    jobCards.each((index, element) => {
      if (index >= 10) return false; // Limit to 10 jobs for performance

      const card = $(element);
      const title = card.find('h2.jobTitle a').text().trim();
      const company = card.find('[data-testid="company-name"]').text().trim();
      const location = card.find('[data-testid="text-location"]').text().trim();
      const description = card.find('.job-snippet').text().trim().replace(/\n/g, ' ');

      if (title && company && location) {
        console.log(`- Found Job: ${title} at ${company}`);
        jobs.push({
          id: `${title}-${index}`,
          title,
          company,
          location,
          description: description || 'No description available.',
        });
      }
    });

    console.log(`Scraped ${jobs.length} jobs successfully.`);
    return jobs;

  } catch (error) {
    console.error('Error during scraping:', error);
    return []; // Return an empty array in case of an error
  } finally {
    if (browser) {
      await browser.close(); // Always close the browser
    }
  }
};