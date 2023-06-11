// /* Autor: Lakzan Nathan */

// import { expect } from 'chai';
// import config from './config.js';
// import { Browser, BrowserContext, Page, chromium } from 'playwright';

// describe('/users/sign-in', () => {
//   let browser: Browser;
//   let context: BrowserContext;
//   let page: Page;
//   //   let userSession: UserSession;

//   before(async () => {
//     browser = await chromium.launch(config.launchOptions);
//   });
//   beforeEach(async () => {
//     context = await browser.newContext();
//     page = await context.newPage();
//     await page.goto(config.clientUrl('/users/sign-in'));
//   });

//   afterEach(async () => {
//     await context.close();
//   });

//   describe('render sign-in', () => {
//     it('should render the page correctly', async () => {
//       await page.fill('#username', 'testuser');
//       expect(await page.textContent('#forgotPasswordButton')).to.not.be.null;
//       expect(await page.textContent('#signUpButton')).to.not.be.null;
//       expect(await page.textContent('app-header a')).to.equal('Log-In');
//       expect(await page.textContent('label')).to.equal('Username');
//       expect(await page.textContent('#forgotPasswordMessage')).to.contain('Forgot you password?');
//       expect(await page.textContent('#notRegisteredMessage')).to.contain('Not registered?');

//       await page.getByRole('button', { name: 'Next' }).click();
//       expect(await page.textContent('label')).to.equal('Password');
//       expect(await page.textContent('#forgotPasswordMessage')).to.contain('Forgot you password?');
//       expect(await page.textContent('#notRegisteredMessage')).to.contain('Not registered?');
//       expect(await page.textContent('#backButton')).to.equal('Back');
//       expect(await page.textContent('#submitButton')).to.equal('Sign-In');
//     });
//   });

//   describe('sign-in process', async () => {
//     it('successfull Sign-in', async () => {
//       await page.fill('#username', 'admin');
//       await page.getByRole('button', { name: 'Next' }).click();
//       await page.fill('#password', 'Password1');
//       await page.getByRole('button', { name: 'Sign-In' }).click();
//       const response = await page.waitForResponse('**/sign-in');
//       expect(response.status()).to.equal(200);
//     });

//     it('wrong Username', async () => {
//       await page.fill('#username', 'admin123');
//       await page.getByRole('button', { name: 'Next' }).click();
//       await page.fill('#password', 'Password1');
//       await page.getByRole('button', { name: 'Sign-In' }).click();
//       const response = await page.waitForResponse('**/sign-in');
//       expect(response.status()).to.equal(401);
//     });

//     it('wrong Password', async () => {
//       await page.fill('#username', 'admin123');
//       await page.getByRole('button', { name: 'Next' }).click();
//       await page.fill('#password', 'Password123');
//       await page.getByRole('button', { name: 'Sign-In' }).click();
//       const response = await page.waitForResponse('**/sign-in');
//       expect(response.status()).to.equal(401);
//     });

//     it('Username to short', async () => {
//       await page.fill('#username', 'ad');
//       await page.getByRole('button', { name: 'Next' }).click();
//       expect(page.getByText('Invalid Input')).to.not.be.null;
//     });

//     it('Password to short', async () => {
//       await page.goto(config.clientUrl('/app/users/sign-in'));
//       await page.fill('#username', 'admin123');
//       await page.getByRole('button', { name: 'Next' }).click();
//       await page.fill('#password', 'Pas');
//       await page.getByRole('button', { name: 'Sign-In' }).click();
//       expect(page.getByText('Invalid Input')).to.not.be.null;
//     });
//   });
// });
