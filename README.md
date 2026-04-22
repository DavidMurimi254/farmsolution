# HOW SYSTEM WORKS

- User signs up in **/signup**.
- After successful signup the page will automatically redirect to **/login** page
- if you try to access the main page (e.g http://localhost:5000), the app will automatically return you to **/login** page.
- In **/signup** page you choose a role, but the admin can only be registered once, the rest of sign up must be agents only.
- After successful login a token will be provided from the backend to give you authorization to the system, depending on the role you are, some features are limited to see
- On desktop the sidebar is visible, but in phone display click the three dashes to make the sidebar appear.
- You have Two pages listed in sidebar, **Dashboard** and **Fields**
The dahsboard has simple boxes showing number of users, fields and crops you have grown.
- In **Field** page you can add or view the data inside the field.
- The field page changes url, and gives you unique url that you can visit any time, or you can share to other users that dont want to sign up.
- In field page you get Plated date, when the crops will be ready, and when the harvest will happen.
- At the bottom you have every crop the user cannot tamper with the data or add anything only the agent and admin.
- Everytime you add a detail, a form must pop up, and you can fill the details as needed.

# HOW TO RUN THE APP
## BACKEND

1. Open backend folder, In terminal run **npm init**, next run **npm install**
2. And add a **.env**
3. Add the following credentials for you local mySQL database, and your jasonwebtoken key.
``
JASONWEBTOKEN=value
PORT_SERVER=value
DATABASENAME=value
DBPORT=value
HOST=value
USER=value
PASSWORD=value
``

4. Next, run **nodemon server.js**, if you face any error about module not found please check on my **package.json** file and check which package isn't there.

5. You can check which package isn't available, by checking all the required packages at the top of **server.js**.

## FRONTEND
1. Open farmsolution folder, run npm i install
2. Run **npm run dev**
3. Follow link after running the code, it will open in browser. Just make sure your server is running too.

## LANGUAGES USED
**REACT** (framework)
**Nodejs**
**MySQL**

## TABLES CREATED
- user TABLE for users data
- field TABLE for fields created
- crop TABLE for crops that will be created
- cropDetails details for the crops