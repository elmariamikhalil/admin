# Project Title: Company Management System
## Documentation

Description The Company Management System is a web application designed to streamline the process of managing company details, including adding new company records with multimedia (logos), and viewing a listing of all companies in a structured table format. This application utilizes modern web technologies such as React, Node.js, and CoreUI for responsive design and efficient backend handling.

Features Add New Company: Allows users to input company details such as name, owner, email, category, and a company logo. View Companies: Displays a list of all companies in a table format, utilizing CoreUI components for a clean and modern user interface. Responsive Design: Adapts seamlessly across different devices and screen sizes, ensuring a consistent user experience. Technologies Used Frontend: React, CoreUI Backend: Node.js, Express Database: MariaDB File Storage: Local filesystem (for logo uploads)


## Installation

Clone the Repository bash Copy code git clone [repository URL] cd [project folder] Install Dependencies bash Copy code

```bash
  npm install my-project
  cd my-project
```
**Install frontend dependencies**
```bash
cd frontend 
npm install
```
**Install backend dependencies**
```bash
cd ../backend 
npm install
```
**Environment Setup**
Create a .env file in the backend directory and update it with your database credentials and other configurations as necessary. Database Setup Run the SQL scripts provided in the database folder to set up your schema and initial tables. Running the Application Start the backend server: 
```bash 
npm start
```
 In a new terminal, start the frontend application: 
```bash
cd ../frontend 
npm start 
```
Access the application through http://localhost:3000 in your browser. Usage Adding a Company: Navigate to the "Add Company" form, fill in the details, and submit. Viewing Companies: Simply visit the home page to see a list of all companies. Contributing We welcome contributions to this project! If you have suggestions or improvements, please fork the repository and submit a pull request.

    
## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)


## Authors

- [@elmariamikhalil](https://www.github.com/elmariamikhalil)

